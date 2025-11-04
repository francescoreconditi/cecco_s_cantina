"use client";

import { RegistratiForm } from "@/components/auth/registrati-form";
import Link from "next/link";

export default function RegistratiPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-wine-50 to-wine-100 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-wine-900">Cantina Vini</h1>
          <p className="mt-2 text-sm text-wine-600">
            Crea il tuo account gratuito
          </p>
        </div>

        <div className="rounded-lg bg-white p-8 shadow-xl">
          <RegistratiForm />

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Hai già un account? </span>
            <Link
              href="/accedi"
              className="font-medium text-wine-600 hover:text-wine-500"
            >
              Accedi
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
