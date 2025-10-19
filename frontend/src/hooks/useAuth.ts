"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function useAuthGuard(requiredRoles: string[] = []) {
  const { user, loading } = useAuth();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      // Garantir que roles existe
      const rolesArray = user.roles || [];
      const hasAccess = rolesArray.some((role) => requiredRoles.includes(role));
      setAuthorized(hasAccess);
    } else if (!loading && !user) {
      setAuthorized(false);
    }
  }, [user, loading, requiredRoles]);

  return { authorized, loading };
}
