"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogoutButton } from "@/components/auth/logout-button";
import Link from "next/link";

export function Header() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const getUserEmail = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserEmail(user.email || null);
      }
    };

    getUserEmail();
  }, []);

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + "/");
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard">
              <h1 className="text-2xl font-bold text-wine-800 cursor-pointer hover:text-wine-900">
                Cantina Vini
              </h1>
            </Link>
            <div className="hidden space-x-4 md:flex">
              <Link
                href="/dashboard"
                className={`text-sm font-medium ${
                  isActive("/dashboard")
                    ? "text-wine-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/vini"
                className={`text-sm font-medium ${
                  isActive("/vini")
                    ? "text-wine-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Vini
              </Link>
              <Link
                href="/bottiglie"
                className={`text-sm font-medium ${
                  isActive("/bottiglie")
                    ? "text-wine-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Bottiglie
              </Link>
              <Link
                href="/degustazioni"
                className={`text-sm font-medium ${
                  isActive("/degustazioni")
                    ? "text-wine-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Degustazioni
              </Link>
              <Link
                href="/ubicazioni"
                className={`text-sm font-medium ${
                  isActive("/ubicazioni")
                    ? "text-wine-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Ubicazioni
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {userEmail && (
              <span className="text-sm text-gray-600">{userEmail}</span>
            )}
            <LogoutButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
