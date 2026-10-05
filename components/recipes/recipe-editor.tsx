"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  Button,
  Card,
  CloseIcon,
  CompactInput,
  Divider,
  Field,
  GripIcon,
  IconButton,
  ImageIcon,
  PlusIcon,
  Textarea,
  TrashIcon,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  instructionSteps,
  recipes,
  uid,
  type Ingredient,
  type Recipe,
} from "@/lib/store";
import { RecipeImage } from "./recipe-card";

/** Downscale a chosen photo to a JPEG small enough for quick uploads. */
async function downscale(file: File, maxWidth = 1200): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Encoding failed"))),
      "image/jpeg",
      0.82,
    ),
  );
}

const blankIngredient = (): Ingredient => ({
  id: uid(),
  name: "",
  quantity: "",
});

type Step = { id: string; text: string };

const blankStep = (): Step => ({ id: uid(), text: "" });

/** How close to a scroll area's edge, in px, dragging a step scrolls it. */
const AUTO_SCROLL_EDGE = 64;
/** The fastest a drag scrolls, in px per frame. */
const AUTO_SCROLL_SPEED = 14;

/** The nearest ancestor that scrolls vertically, else the page. */
function scrollParent(el: Element | null): Element {
  for (let node = el?.parentElement; node; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node);
    if (
      (overflowY === "auto" || overflowY === "scroll") &&
      node.scrollHeight > node.clientHeight
    )
      return node;
  }
  return document.scrollingElement ?? document.documentElement;
}

export function RecipeEditor({
  recipe,
  onCancel,
  onSaved,
  onDeleted,
  bare = false,
  onDirtyChange,
}: {
  recipe?: Recipe;
  onCancel: () => void;
  onSaved: (id: string) => void;
  onDeleted?: () => void;
  /** Render without the card frame, e.g. inside a modal. */
  bare?: boolean;
  /** Called when the form goes from empty to filled in, or back. */
  onDirtyChange?: (dirty: boolean) => void;
}) {
  const [name, setName] = useState(recipe?.name ?? "");
  const [minutes, setMinutes] = useState(String(recipe?.minutes ?? ""));
  const [image, setImage] = useState(recipe?.image);
  /** A newly chosen photo, uploaded on save. `image` holds its preview URL. */
  const [photo, setPhoto] = useState<Blob>();
  const [saving, setSaving] = useState(false);
  /** True while a chosen photo is being downscaled. */
  const [preparing, setPreparing] = useState(false);
  const [error, setError] = useState("");
  const [steps, setSteps] = useState<Step[]>(() => {
    const saved = instructionSteps(recipe?.instructions ?? "");
    return saved.length
      ? saved.map((text) => ({ id: uid(), text }))
      : [blankStep()];
  });
  /** The step to focus when it mounts, i.e. one just added. */
  const [focusStepId, setFocusStepId] = useState<string>();
  /** The save/cancel row, scrolled into view when a step is appended. */
  const actionsRef = useRef<HTMLDivElement>(null);
  const stepListRef = useRef<HTMLOListElement>(null);
  /** The step being dragged by its handle. */
  const [draggingStepId, setDraggingStepId] = useState<string>();
  /** Steps can't contain newlines, since they're stored newline-separated. */
  const instructions = steps
    .map((s) => s.text.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean)
    .join("\n");
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    recipe?.ingredients.length ? recipe.ingredients : [blankIngredient()],
  );

  const dirty =
    name !== (recipe?.name ?? "") ||
    minutes !== String(recipe?.minutes ?? "") ||
    image !== recipe?.image ||
    instructions !== instructionSteps(recipe?.instructions ?? "").join("\n") ||
    ingredients.some((i) => {
      const saved = recipe?.ingredients.find((x) => x.id === i.id);
      return (
        i.name !== (saved?.name ?? "") || i.quantity !== (saved?.quantity ?? "")
      );
    }) ||
    ingredients.length !== (recipe?.ingredients.length || 1);

  useEffect(() => onDirtyChange?.(dirty), [dirty, onDirtyChange]);

  // Focusing a new last step only scrolls the step itself into view; bring
  // "Add step" and the save button below it into view too.
  useEffect(() => {
    if (focusStepId && steps.at(-1)?.id === focusStepId)
      actionsRef.current?.scrollIntoView({ block: "nearest" });
    // Only when a step is added, not on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusStepId]);

  const updateIngredient = (id: string, patch: Partial<Ingredient>) =>
    setIngredients((list) =>
      list.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    );

  const updateStep = (id: string, text: string) =>
    setSteps((list) => list.map((s) => (s.id === id ? { ...s, text } : s)));

  const addStep = (afterId?: string) => {
    const step = blankStep();
    setSteps((list) => {
      const at = afterId ? list.findIndex((s) => s.id === afterId) + 1 : 0;
      return at > 0
        ? [...list.slice(0, at), step, ...list.slice(at)]
        : [...list, step];
    });
    setFocusStepId(step.id);
  };

  const moveStep = (id: string, to: number) =>
    setSteps((list) => {
      const from = list.findIndex((s) => s.id === id);
      if (from === to || to < 0 || to >= list.length) return list;
      const next = list.filter((s) => s.id !== id);
      next.splice(to, 0, list[from]);
      return next;
    });

  // Listen on the window rather than capturing the pointer on the handle,
  // since reordering can move the handle's node and drop the capture.
  useEffect(() => {
    if (!draggingStepId) return;
    const scroller = scrollParent(stepListRef.current);
    let pointerY: number | undefined;
    let frame = 0;

    const reorder = () => {
      if (pointerY === undefined) return;
      const y = pointerY;
      const rows = [...(stepListRef.current?.children ?? [])] as HTMLElement[];
      // The dragged step goes after every other step whose middle is above
      // the pointer.
      const to = rows.filter((row) => {
        if (row.dataset.stepId === draggingStepId) return false;
        const { top, height } = row.getBoundingClientRect();
        return top + height / 2 < y;
      }).length;
      moveStep(draggingStepId, to);
    };

    // While the pointer is near the top or bottom of the scroll area, scroll
    // it, faster the closer the pointer is to the edge.
    const autoScroll = () => {
      frame = requestAnimationFrame(autoScroll);
      if (pointerY === undefined) return;
      const { top, bottom } =
        scroller === document.scrollingElement
          ? { top: 0, bottom: window.innerHeight }
          : scroller.getBoundingClientRect();
      const edge = Math.min(AUTO_SCROLL_EDGE, (bottom - top) / 4);
      const depth =
        pointerY < top + edge
          ? pointerY - (top + edge)
          : pointerY > bottom - edge
            ? pointerY - (bottom - edge)
            : 0;
      if (!depth) return;
      const before = scroller.scrollTop;
      scroller.scrollTop +=
        Math.sign(depth) *
        Math.min(1, Math.abs(depth) / edge) *
        AUTO_SCROLL_SPEED;
      // The rows moved under the pointer.
      if (scroller.scrollTop !== before) reorder();
    };

    const move = (e: PointerEvent) => {
      pointerY = e.clientY;
      reorder();
    };
    const end = () => setDraggingStepId(undefined);
    frame = requestAnimationFrame(autoScroll);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
    };
  }, [draggingStepId]);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const id = recipe?.id ?? uid();
    setSaving(true);
    setError("");
    try {
      await recipes.save(
        {
          id,
          name: name.trim(),
          minutes: Math.min(10000, Math.max(0, parseInt(minutes, 10) || 0)),
          image: photo ? undefined : image,
          instructions,
          ingredients: ingredients
            .filter((i) => i.name.trim())
            .map((i) => ({
              ...i,
              name: i.name.trim(),
              quantity: i.quantity.trim(),
            })),
        },
        photo,
      );
      onSaved(id);
    } catch (err) {
      console.error(err);
      setError("Couldn't upload the photo. Try again.");
      setSaving(false);
    }
  };

  const remove = () => {
    if (!recipe || !confirm(`Delete “${recipe.name}”?`)) return;
    recipes.remove(recipe.id);
    onDeleted?.();
  };

  const Frame = bare ? "div" : Card;

  return (
    <Frame className="px-[22px] pt-[18px] pb-5">
      <form onSubmit={save}>
        <h2 className="text-title text-ink-900">
          {recipe ? `Edit ${recipe.name}` : "New recipe"}
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-[200px_1fr]">
          <div className="flex flex-col gap-2">
            <RecipeImage recipe={{ name, image }} />
            <div className="flex gap-2">
              <label
                className={cn(
                  "inline-flex h-9 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-control border border-line text-label font-medium text-ink-800 transition-colors hover:bg-muted has-focus-visible:outline-2 has-focus-visible:outline-brand-500",
                  preparing && "pointer-events-none opacity-50",
                )}
              >
                <ImageIcon size={16} />
                {preparing
                  ? "Preparing…"
                  : image
                    ? "Change photo"
                    : "Add photo"}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  disabled={preparing || saving}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setPreparing(true);
                    setError("");
                    try {
                      const blob = await downscale(file);
                      setPhoto(blob);
                      setImage(URL.createObjectURL(blob));
                    } catch (err) {
                      console.error(err);
                      setError("Couldn't read that photo. Try another one.");
                    } finally {
                      setPreparing(false);
                    }
                  }}
                />
              </label>
              {image && (
                <IconButton
                  label="Remove photo"
                  className="size-9 border border-line"
                  onClick={() => {
                    setImage(undefined);
                    setPhoto(undefined);
                  }}
                >
                  <CloseIcon size={16} />
                </IconButton>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <Field label="Name" htmlFor="recipe-name">
              <CompactInput
                id="recipe-name"
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Lemon chicken"
              />
            </Field>
            <Field label="Time (minutes)" htmlFor="recipe-minutes">
              <CompactInput
                id="recipe-minutes"
                type="number"
                min={0}
                inputMode="numeric"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                placeholder="30"
                className="max-w-32"
              />
            </Field>
          </div>
        </div>

        <h3 className="mt-5 text-label font-semibold text-ink-900">
          Ingredients
        </h3>
        <ul className="mt-2 flex flex-col gap-2">
          {ingredients.map((ing, i) => (
            <li key={ing.id} className="flex items-center gap-2">
              <CompactInput
                aria-label={`Ingredient ${i + 1}`}
                placeholder="Ingredient"
                value={ing.name}
                onChange={(e) =>
                  updateIngredient(ing.id, { name: e.target.value })
                }
                className="min-w-0 flex-[2]"
              />
              <CompactInput
                aria-label={`Quantity for ingredient ${i + 1}`}
                placeholder="Qty"
                value={ing.quantity}
                onChange={(e) =>
                  updateIngredient(ing.id, { quantity: e.target.value })
                }
                className="min-w-0 flex-1"
              />
              <IconButton
                label={`Remove ingredient ${i + 1}`}
                className="size-10"
                onClick={() =>
                  setIngredients((list) => list.filter((x) => x.id !== ing.id))
                }
              >
                <TrashIcon size={18} />
              </IconButton>
            </li>
          ))}
        </ul>
        <Button
          variant="link"
          size="sm"
          icon={<PlusIcon size={16} />}
          onClick={() => setIngredients((list) => [...list, blankIngredient()])}
          className="mt-3 font-semibold"
        >
          Add ingredient
        </Button>

        <Divider className="mt-5" />

        <h3 className="mt-4 text-label font-semibold text-ink-900">
          Instructions
        </h3>
        <ol ref={stepListRef} className="mt-2 flex flex-col gap-2">
          {steps.map((step, i) => (
            <li
              key={step.id}
              data-step-id={step.id}
              className={cn(
                "flex items-start gap-2 rounded-field",
                draggingStepId === step.id &&
                  "relative z-10 bg-surface shadow-popover",
              )}
            >
              <button
                type="button"
                data-step-handle={step.id}
                aria-label={`Reorder step ${i + 1}`}
                title="Drag to reorder"
                onPointerDown={(e) => {
                  if (e.button !== 0) return;
                  // Keeps the drag from selecting text.
                  e.preventDefault();
                  setDraggingStepId(step.id);
                }}
                onKeyDown={(e) => {
                  const to =
                    e.key === "ArrowUp"
                      ? i - 1
                      : e.key === "ArrowDown"
                        ? i + 1
                        : -1;
                  if (to < 0 || to >= steps.length) return;
                  e.preventDefault();
                  moveStep(step.id, to);
                  // Moving the row can blur its handle.
                  requestAnimationFrame(() =>
                    stepListRef.current
                      ?.querySelector<HTMLElement>(
                        `[data-step-handle="${step.id}"]`,
                      )
                      ?.focus(),
                  );
                }}
                className={cn(
                  "-mr-1 flex h-10 w-5 shrink-0 touch-none items-center justify-center rounded-control text-ink-400 hover:text-ink-700",
                  draggingStepId === step.id
                    ? "cursor-grabbing"
                    : "cursor-grab",
                )}
              >
                <GripIcon size={16} />
              </button>
              <span
                aria-hidden
                className="flex h-10 w-5 shrink-0 items-center justify-end text-label font-semibold text-ink-500"
              >
                {i + 1}.
              </span>
              <Textarea
                aria-label={`Step ${i + 1}`}
                placeholder={i === 0 ? "How do you start?" : "What's next?"}
                rows={1}
                value={step.text}
                autoFocus={step.id === focusStepId}
                onChange={(e) => updateStep(step.id, e.target.value)}
                onKeyDown={(e) => {
                  // Enter starts a new step; Shift+Enter is swallowed too,
                  // since a step is a single paragraph.
                  if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    addStep(step.id);
                  }
                }}
                className="field-sizing-content min-h-10 min-w-0 flex-1 resize-none py-2"
              />
              <IconButton
                label={`Remove step ${i + 1}`}
                className="size-10"
                onClick={() =>
                  setSteps((list) => list.filter((x) => x.id !== step.id))
                }
              >
                <TrashIcon size={18} />
              </IconButton>
            </li>
          ))}
        </ol>
        <Button
          variant="link"
          size="sm"
          icon={<PlusIcon size={16} />}
          onClick={() => addStep()}
          className="mt-3 font-semibold"
        >
          Add step
        </Button>

        {error && (
          <p role="alert" className="mt-4 text-label text-danger-600">
            {error}
          </p>
        )}

        <div ref={actionsRef} className="mt-5 flex items-center gap-2">
          {recipe && (
            <Button
              variant="danger"
              size="sm"
              icon={<TrashIcon size={16} />}
              onClick={remove}
            >
              Delete
            </Button>
          )}
          <div className="ml-auto flex gap-2">
            <Button variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={saving || preparing}>
              {saving
                ? "Saving…"
                : recipe
                  ? "Save changes"
                  : "Create recipe"}
            </Button>
          </div>
        </div>
      </form>
    </Frame>
  );
}
