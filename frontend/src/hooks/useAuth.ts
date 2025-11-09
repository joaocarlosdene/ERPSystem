"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function useAuthGuard(requiredRoles: string[] = []) {
  const { user, loading } = useAuth();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Enquanto estiver carregando, não decide nada
    if (loading) return;

    if (user) {
      const rolesArray = user.roles || [];
      const hasAccess =
        requiredRoles.length === 0 ||
        rolesArray.some((role) => requiredRoles.includes(role));
      setAuthorized(hasAccess);
    } else {
      setAuthorized(false);
    }
  }, [user, loading, requiredRoles]);

  return { authorized, loading };
}
