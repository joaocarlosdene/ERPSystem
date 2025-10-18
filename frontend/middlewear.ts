import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const routePermissions: Record<string, string[]> = {
  "/dashboard": ["master", "financeiro", "gestao", "producao"],
  "/financeiro": ["master", "financeiro"],
  "/gestao": ["master", "gestao"],
  "/producao": ["master", "producao"],
};

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const token = request.cookies.get("token")?.value;

  // Redireciona para login se não estiver logado
  if (!token && url.pathname !== "/") {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Usuário logado tentando acessar login
  if (token && url.pathname === "/login") {
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Rotas protegidas
  const matchedRoute = Object.keys(routePermissions).find((route) =>
    url.pathname.startsWith(route)
  );

  if (matchedRoute && token) {
    try {
      const secret = process.env.JWT_SECRET!;
      const decoded: any = jwt.verify(token, secret); // decodifica JWT
      const userRole = decoded.role;

      const allowedRoles = routePermissions[matchedRoute];
      if (!allowedRoles.includes(userRole)) {
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      }
    } catch {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Rotas observadas pelo middleware
export const config = {
  matcher: ["/dashboard/:path*", "/financeiro/:path*", "/gestao/:path*", "/producao/:path*"],
};
