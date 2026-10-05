import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "outline" | "ghost" | "link" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-ink-inverse shadow-control hover:bg-brand-700 active:bg-brand-800",
  outline:
    "border border-brand-600 bg-surface text-brand-800 hover:bg-brand-50 active:bg-brand-100",
  ghost: "text-ink-800 hover:bg-muted active:bg-line-subtle",
  link: "text-brand-800 hover:text-brand-600 hover:underline underline-offset-4",
  danger: "text-danger-600 hover:bg-danger-50",
};

const sizes: Record<Size, string> = {
  sm: "h-9 gap-1.5 rounded-control px-3 text-label",
  md: "h-11 gap-2 rounded-field px-4 text-control",
  lg: "h-[46px] gap-2.5 rounded-field px-[18px] text-control",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  icon,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex shrink-0 cursor-pointer items-center justify-center font-medium whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50",
        sizes[size],
        variants[variant],
        variant === "link" && "h-auto px-0",
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  variant?: "primary" | "subtle" | "ghost";
};

const iconVariants = {
  primary:
    "bg-brand-600 text-ink-inverse shadow-control hover:bg-brand-700 active:bg-brand-800 rounded-field",
  subtle:
    "border border-line bg-sunken text-brand-800 hover:bg-muted rounded-control",
  ghost: "text-ink-600 hover:bg-muted hover:text-ink-900 rounded-control",
};

export function IconButton({
  label,
  variant = "ghost",
  className,
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex shrink-0 cursor-pointer items-center justify-center transition-colors disabled:pointer-events-none disabled:opacity-50",
        iconVariants[variant],
        className,
      )}
      {...props}
    />
  );
}
