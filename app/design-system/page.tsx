import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  Avatar,
  Button,
  Card,
  CartIcon,
  CheckIcon,
  ChevronDownIcon,
  ClockIcon,
  CloseIcon,
  CompactInput,
  Divider,
  Field,
  IconButton,
  ImageIcon,
  Input,
  LeafIcon,
  Logo,
  MoreVerticalIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  SearchInput,
  TrashIcon,
  UserIcon,
} from "@/components/ui";
import { DesignSystemDemos } from "./demos";

export const metadata: Metadata = { title: "Design system · basku" };

const colorGroups: { name: string; tokens: [string, string][] }[] = [
  {
    name: "Surfaces",
    tokens: [
      ["canvas", "#faf8f4"],
      ["surface", "#fdfcfa"],
      ["sunken", "#f6f4ef"],
      ["muted", "#f1efea"],
    ],
  },
  {
    name: "Lines",
    tokens: [
      ["line", "#e9e6e1"],
      ["line-subtle", "#f0eeea"],
    ],
  },
  {
    name: "Ink",
    tokens: [
      ["ink-900", "#0f1b2a"],
      ["ink-800", "#1d2533"],
      ["ink-600", "#444c5c"],
      ["ink-500", "#636a78"],
      ["ink-400", "#8a8f9c"],
      ["ink-300", "#b9bcc4"],
    ],
  },
  {
    name: "Brand",
    tokens: [
      ["brand-50", "#eef4ef"],
      ["brand-100", "#dce9df"],
      ["brand-200", "#b9d3c0"],
      ["brand-500", "#3c7a4c"],
      ["brand-600", "#2f653e"],
      ["brand-700", "#275535"],
      ["brand-800", "#1d4a2b"],
    ],
  },
  {
    name: "Feedback",
    tokens: [
      ["danger-50", "#fbefed"],
      ["danger-600", "#b4372f"],
    ],
  },
];

const typeScale = [
  ["text-display", "34 / 700", "Weekly groceries", "text-display text-ink-900"],
  ["text-title", "19 / 600", "Lemon chicken", "text-title text-ink-900"],
  ["text-body", "16 / 500", "Avocados", "text-body font-medium text-ink-900"],
  ["text-control", "15 / 400", "Add an item...", "text-control text-ink-500"],
  [
    "text-label",
    "14 / 400–600",
    "Season the chicken, sear until golden.",
    "text-label text-ink-600",
  ],
  [
    "text-caption",
    "13 / 400",
    "1 of 6 items checked",
    "text-caption text-ink-500",
  ],
];

const radii = [
  ["rounded-control", "8px"],
  ["rounded-field", "10px"],
  ["rounded-card", "12px"],
  ["rounded-full", "pill"],
];

const icons = {
  PlusIcon,
  ChevronDownIcon,
  CheckIcon,
  MoreVerticalIcon,
  SearchIcon,
  ClockIcon,
  PencilIcon,
  CartIcon,
  TrashIcon,
  CloseIcon,
  ImageIcon,
  UserIcon,
  LeafIcon,
};

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-title text-ink-900">{title}</h2>
      {children}
    </section>
  );
}

export default function DesignSystemPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-12 px-4 py-12">
      <header>
        <Logo />
        <h1 className="mt-6 text-display text-ink-900">Design system</h1>
        <p className="mt-2 max-w-xl text-control text-ink-600">
          Tokens live in <code className="text-label">app/globals.css</code> and
          components in <code className="text-label">components/ui</code>. Warm
          off-white surfaces, near-black navy ink, and a single basil-green
          accent.
        </p>
      </header>

      <Section title="Color">
        {colorGroups.map((group) => (
          <div key={group.name}>
            <h3 className="mb-2 text-label font-semibold text-ink-900">
              {group.name}
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {group.tokens.map(([name, hex]) => (
                <div
                  key={name}
                  className="overflow-hidden rounded-card border border-line bg-surface"
                >
                  <div className="h-14" style={{ background: hex }} />
                  <div className="px-3 py-2">
                    <p className="text-label font-medium text-ink-900">
                      {name}
                    </p>
                    <p className="text-caption text-ink-500">{hex}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Section>

      <Section title="Typography — Figtree">
        <Card className="divide-y divide-line-subtle">
          {typeScale.map(([token, spec, sample, cls]) => (
            <div
              key={token}
              className="flex flex-wrap items-baseline gap-x-6 gap-y-1 px-5 py-4"
            >
              <div className="w-36 shrink-0">
                <p className="text-label font-medium text-ink-900">{token}</p>
                <p className="text-caption text-ink-500">{spec}</p>
              </div>
              <p className={cls}>{sample}</p>
            </div>
          ))}
        </Card>
      </Section>

      <Section title="Radius & elevation">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-6">
          {radii.map(([cls, label]) => (
            <div key={cls} className="flex flex-col items-center gap-2">
              <div
                className={`size-16 border border-line bg-brand-50 ${cls}`}
              />
              <p className="text-caption text-ink-600">{label}</p>
            </div>
          ))}
          <div className="flex flex-col items-center gap-2">
            <div className="size-16 rounded-field bg-surface shadow-control" />
            <p className="text-caption text-ink-600">shadow-control</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="size-16 rounded-card bg-surface shadow-popover" />
            <p className="text-caption text-ink-600">shadow-popover</p>
          </div>
        </div>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button size="lg" icon={<PlusIcon size={22} />}>
            Create recipe
          </Button>
          <Button>Primary</Button>
          <Button size="sm">Small</Button>
          <Button variant="outline" size="sm" icon={<CartIcon size={20} />}>
            Add ingredients to grocery list
          </Button>
          <Button variant="ghost" size="sm">
            Ghost
          </Button>
          <Button
            variant="link"
            size="sm"
            icon={<PlusIcon size={18} />}
            className="font-semibold"
          >
            New list
          </Button>
          <Button variant="link" size="sm" icon={<PencilIcon size={16} />}>
            Edit
          </Button>
          <Button variant="danger" size="sm" icon={<TrashIcon size={16} />}>
            Delete
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <IconButton label="Add" variant="primary" className="h-[52px] w-14">
            <PlusIcon size={26} />
          </IconButton>
          <IconButton label="Switch list" variant="subtle" className="h-8 w-9">
            <ChevronDownIcon size={18} />
          </IconButton>
          <IconButton label="More" className="size-8 text-ink-800">
            <MoreVerticalIcon size={20} />
          </IconButton>
          <Avatar />
        </div>
      </Section>

      <Section title="Inputs">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input placeholder="Add an item..." aria-label="Example input" />
          <SearchInput
            placeholder="Search recipes..."
            aria-label="Example search"
          />
          <Field label="Field label" htmlFor="ds-compact">
            <CompactInput id="ds-compact" placeholder="Compact input" />
          </Field>
        </div>
      </Section>

      <DesignSystemDemos />

      <Section title="Iconography">
        <p className="-mt-2 text-label text-ink-600">
          24px grid, 1.75 stroke, round caps. Sized 16–26 depending on context.
        </p>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-7">
          {Object.entries(icons).map(([name, Icon]) => (
            <div
              key={name}
              className="flex flex-col items-center gap-2 rounded-card border border-line bg-surface py-4 text-ink-800"
            >
              <Icon size={22} />
              <p className="text-[11px] text-ink-500">
                {name.replace("Icon", "")}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Divider">
        <Divider />
      </Section>
    </div>
  );
}
