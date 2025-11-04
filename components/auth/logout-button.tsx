"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/accedi");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="rounded-md bg-wine-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-wine-500 disabled:opacity-50"
    >
      {loading ? "Uscita..." : "Esci"}
    </button>
  );
}
