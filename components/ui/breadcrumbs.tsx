"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  customLabels?: Record<string, string>;
}

/**
 * Componente Breadcrumbs per la navigazione gerarchica
 *
 * Può essere usato in due modi:
 * 1. Automatico: genera breadcrumbs dal pathname
 * 2. Manuale: passa un array di items custom
 */
export function Breadcrumbs({ items, customLabels = {} }: BreadcrumbsProps) {
  const pathname = usePathname();

  // Mappa dei labels personalizzati per i path comuni
  const defaultLabels: Record<string, string> = {
    dashboard: "Dashboard",
    vini: "Vini",
    bottiglie: "Bottiglie",
    degustazioni: "Degustazioni",
    ubicazioni: "Ubicazioni",
    nuovo: "Nuovo",
    nuova: "Nuova",
    modifica: "Modifica",
    ...customLabels,
  };

  // Genera breadcrumbs automaticamente dal pathname
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const paths = pathname.split("/").filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    paths.forEach((path, index) => {
      // Skip UUID-like paths (ids dinamici)
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(path)) {
        breadcrumbs.push({
          label: "Dettaglio",
          href: `/${paths.slice(0, index + 1).join("/")}`,
        });
        return;
      }

      const href = `/${paths.slice(0, index + 1).join("/")}`;
      const label = defaultLabels[path] || path.charAt(0).toUpperCase() + path.slice(1);

      breadcrumbs.push({ label, href });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbs();

  // Non mostrare breadcrumbs se siamo in home o se c'è un solo item
  if (pathname === "/" || breadcrumbItems.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-1 text-sm">
      <Link
        href="/dashboard"
        className="flex items-center text-gray-500 hover:text-wine-600 transition-colors"
      >
        <Home className="h-4 w-4" />
        <span className="sr-only">Dashboard</span>
      </Link>

      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;

        return (
          <div key={item.href} className="flex items-center space-x-1">
            <ChevronRight className="h-4 w-4 text-gray-400" />
            {isLast ? (
              <span className="font-medium text-gray-900" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-gray-500 hover:text-wine-600 transition-colors"
              >
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
