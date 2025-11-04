"use client";

import { AccediForm } from "@/components/auth/accedi-form";
import Link from "next/link";

export default function AccediPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-wine-50 to-wine-100 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-wine-900">Cantina Vini</h1>
          <p className="mt-2 text-sm text-wine-600">
            Accedi alla tua cantina personale
          </p>
        </div>

        <div className="rounded-lg bg-white p-8 shadow-xl">
          <AccediForm />

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Non hai un account? </span>
            <Link
              href="/registrati"
              className="font-medium text-wine-600 hover:text-wine-500"
            >
              Registrati
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
