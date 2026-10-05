"use client";

import {
  useState,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/cn";
import { EyeIcon, EyeOffIcon, SearchIcon } from "./icons";

const field =
  "w-full rounded-field border border-line bg-surface text-control text-ink-900 placeholder:text-ink-500 transition-colors hover:border-ink-300 focus:border-brand-500 focus:outline-none focus:ring-3 focus:ring-brand-100";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input className={cn(field, "h-[52px] px-[18px]", className)} {...props} />
  );
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        field,
        "min-h-24 resize-y px-3.5 py-2.5 text-label",
        className,
      )}
      {...props}
    />
  );
}

export function SearchInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={cn("relative", className)}>
      <SearchIcon
        size={20}
        className="pointer-events-none absolute top-1/2 left-[17px] -translate-y-1/2 text-ink-500"
      />
      <input
        type="search"
        className={cn(field, "h-[50px] pr-4 pl-[50px]")}
        {...props}
      />
    </div>
  );
}

/** Password input with a show/hide toggle. */
export function PasswordInput({
  className,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [visible, setVisible] = useState(false);
  const Toggle = visible ? EyeOffIcon : EyeIcon;
  return (
    <div className={cn("relative", className)}>
      <input
        type={visible ? "text" : "password"}
        className={cn(field, "h-[52px] pr-[52px] pl-[18px]")}
        {...props}
      />
      <button
        type="button"
        // Keep focus on the input so tapping the toggle doesn't dismiss the
        // on-screen keyboard.
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute top-1/2 right-1.5 flex size-10 -translate-y-1/2 items-center justify-center rounded-control text-ink-500 transition-colors hover:text-ink-900 focus-visible:ring-3 focus-visible:ring-brand-100 focus-visible:outline-none"
      >
        <Toggle size={20} />
      </button>
    </div>
  );
}

/** Label + control stack used in forms. */
export function Field({
  label,
  htmlFor,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="text-label font-semibold text-ink-900"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

/** Compact input for dense forms (dialogs, inline edits). */
export function CompactInput({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(field, "h-10 px-3 text-label", className)}
      {...props}
    />
  );
}
