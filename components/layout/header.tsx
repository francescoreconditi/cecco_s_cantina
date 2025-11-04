"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogoutButton } from "@/components/auth/logout-button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
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
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard">
              <h1 className="text-2xl font-bold text-wine-800 dark:text-wine-400 cursor-pointer hover:text-wine-900 dark:hover:text-wine-300 transition-colors">
                Cantina Vini
              </h1>
            </Link>
            <div className="hidden space-x-4 md:flex">
              <Link
                href="/dashboard"
                className={`text-sm font-medium transition-colors ${
                  isActive("/dashboard")
                    ? "text-wine-600 dark:text-wine-400"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/vini"
                className={`text-sm font-medium transition-colors ${
                  isActive("/vini")
                    ? "text-wine-600 dark:text-wine-400"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Vini
              </Link>
              <Link
                href="/bottiglie"
                className={`text-sm font-medium transition-colors ${
                  isActive("/bottiglie")
                    ? "text-wine-600 dark:text-wine-400"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Bottiglie
              </Link>
              <Link
                href="/degustazioni"
                className={`text-sm font-medium transition-colors ${
                  isActive("/degustazioni")
                    ? "text-wine-600 dark:text-wine-400"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Degustazioni
              </Link>
              <Link
                href="/ubicazioni"
                className={`text-sm font-medium transition-colors ${
                  isActive("/ubicazioni")
                    ? "text-wine-600 dark:text-wine-400"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Ubicazioni
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {userEmail && (
              <span className="text-sm text-gray-600 dark:text-gray-300">{userEmail}</span>
            )}
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
