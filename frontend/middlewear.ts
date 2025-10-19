import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

interface DecodedUser {
  id: string;
  email: string;
  roles: string[];
  isMaster?: boolean;
  iat?: number;
  exp?: number;
}

// Mapa de permissões por rota
const routePermissions: Record<string, string[]> = {
  "/dashboard": ["master", "financeiro", "gestao", "producao"],
  "/financeiro": ["master", "financeiro"],
  "/gestao": ["master", "gestao"],
  "/producao": ["master", "producao"],
};

// Middleware global
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const token = request.cookies.get("token")?.value;
  const path = url.pathname.replace(/\/$/, ""); // normaliza o path (remove "/" final)

  // 🔹 Se usuário NÃO estiver logado e tentar acessar rota protegida → redireciona pro login
  const isProtected = Object.keys(routePermissions).some((route) =>
    path.startsWith(route)
  );
  if (isProtected && !token) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 🔹 Se usuário logado tenta acessar /login ou / → manda pro dashboard
  if (token && (path === "/" || path === "/login")) {
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // 🔹 Verifica token e permissões
  if (token) {
    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) throw new Error("JWT_SECRET não configurado!");

      const decoded = jwt.verify(token, secret) as DecodedUser;

      const matchedRoute = Object.keys(routePermissions).find((route) =>
        path.startsWith(route)
      );

      if (matchedRoute) {
        const allowedRoles = routePermissions[matchedRoute];
        const userRoles = decoded.roles || [];
        const isMaster = decoded.isMaster;

        // Se não for master e não tiver nenhuma role permitida → bloqueia
        if (!isMaster && !userRoles.some((r) => allowedRoles.includes(r))) {
          url.pathname = "/dashboard";
          return NextResponse.redirect(url);
        }
      }

      // Token válido → segue normalmente
      return NextResponse.next();
    } catch (err) {
      // Token inválido ou expirado → apaga cookie e volta pro login
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("token");
      return response;
    }
  }

  // Se não for rota protegida → segue normalmente
  return NextResponse.next();
}

// 🔍 Define as rotas monitoradas pelo middleware
export const config = {
  matcher: [
    "/",
    "/login",
    "/dashboard/:path*",
    "/financeiro/:path*",
    "/gestao/:path*",
    "/producao/:path*",
  ],
};
