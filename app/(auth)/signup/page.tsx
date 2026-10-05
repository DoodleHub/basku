import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { signup } from "../actions";

export const metadata: Metadata = { title: "Sign up · basku" };

export default function SignupPage() {
  return <AuthForm mode="signup" action={signup} />;
}
