"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#08050f]">
        <div className="h-10 w-10 rounded-full border border-[#B98CF7]/20 border-t-[#B98CF7] shadow-[0_0_40px_rgba(185,140,247,0.35)] animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
