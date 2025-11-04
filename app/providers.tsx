"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ThemeProvider } from "next-themes";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "sonner";
import { ConnectionIndicator } from "@/components/ui/connection-indicator";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minuto
            gcTime: 10 * 60 * 1000, // 10 minuti (precedentemente cacheTime)
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          {children}
          <Toaster
            position="top-center"
            richColors
            closeButton
            toastOptions={{
              classNames: {
                toast: "rounded-lg shadow-lg",
                title: "font-semibold",
                description: "text-sm",
                success: "bg-green-50 border-green-200",
                error: "bg-red-50 border-red-200",
                warning: "bg-yellow-50 border-yellow-200",
                info: "bg-blue-50 border-blue-200",
              },
            }}
          />
          <ConnectionIndicator />
        </ErrorBoundary>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
