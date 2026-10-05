"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthState } from "@/app/(auth)/actions";
import { Button, Field, Input } from "@/components/ui";

type Mode = "login" | "signup";

const copy: Record<
  Mode,
  {
    title: string;
    submit: string;
    pending: string;
    prompt: string;
    alt: string;
    altHref: string;
  }
> = {
  login: {
    title: "Welcome back",
    submit: "Log in",
    pending: "Logging in…",
    prompt: "New to basku?",
    alt: "Create an account",
    altHref: "/signup",
  },
  signup: {
    title: "Create your account",
    submit: "Sign up",
    pending: "Creating account…",
    prompt: "Already have an account?",
    alt: "Log in",
    altHref: "/login",
  },
};

export function AuthForm({
  mode,
  action,
}: {
  mode: Mode;
  action: (state: AuthState, formData: FormData) => Promise<AuthState>;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const t = copy[mode];

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <h1 className="text-2xl font-semibold tracking-[-0.01em] text-ink-900">
        {t.title}
      </h1>

      <Field label="Email" htmlFor="email">
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.email}
        />
      </Field>

      <Field label="Password" htmlFor="password">
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
        />
      </Field>

      {state.error && (
        <p
          role="alert"
          className="rounded-control bg-danger-50 px-3 py-2 text-label text-danger-600"
        >
          {state.error}
        </p>
      )}
      {state.message && (
        <p
          role="status"
          className="rounded-control bg-brand-50 px-3 py-2 text-label text-brand-800"
        >
          {state.message}
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? t.pending : t.submit}
      </Button>

      <p className="text-center text-label text-ink-600">
        {t.prompt}{" "}
        <Link
          href={t.altHref}
          className="font-medium text-brand-800 underline-offset-4 hover:underline"
        >
          {t.alt}
        </Link>
      </p>
    </form>
  );
}
