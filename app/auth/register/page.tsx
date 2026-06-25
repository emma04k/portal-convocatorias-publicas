import { AuthForm } from "@/components/auth/auth-form";

export default function RegisterPage() {
  return (
    <main className="page-shell auth-shell">
      <AuthForm mode="register" />
    </main>
  );
}
