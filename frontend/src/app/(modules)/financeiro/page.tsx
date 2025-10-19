"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function FinanceiroPage() {
  const { user, loading, isAuthorized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) router.push("/login");
      else if (!isAuthorized(["financeiro", "master"])) router.push("/dashboard");
    }
  }, [loading, user, router, isAuthorized]);

  if (loading) return <div>Carregando...</div>;
  if (!user) return null;

  return <div>📊 Área Financeira — acesso restrito.</div>;
}
