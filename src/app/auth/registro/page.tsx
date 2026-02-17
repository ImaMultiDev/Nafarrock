import Link from "next/link";
import { RegisterForm } from "./RegisterForm";

export const metadata = {
  title: "Registro",
  description: "Regístrate en Nafarrock",
};

export default function RegistroPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-2xl font-bold text-void-50">
        Registrarse en Nafarrock
      </h1>
      <p className="mt-2 text-void-400">
        Crea una cuenta como usuario, banda o promotor.
      </p>
      <RegisterForm />
      <p className="mt-6 text-center text-sm text-void-500">
        ¿Ya tienes cuenta?{" "}
        <Link href="/auth/login" className="text-rock-400 hover:underline">
          Entrar
        </Link>
      </p>
    </main>
  );
}
