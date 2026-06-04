import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Read auth cookies set by client on login
  const authToken = request.cookies.get("auth_token")?.value
  const userRole = request.cookies.get("user_role")?.value

  const isAdminRoute = pathname.startsWith("/dashboard")
  const isTeacherRoute = pathname.startsWith("/teacher")
  const isProtectedRoute = isAdminRoute || isTeacherRoute

  // Unauthenticated → redirect to login
  if (isProtectedRoute && !authToken) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Role-based route guards
  if (isAdminRoute && userRole === "teacher") {
    return NextResponse.redirect(new URL("/teacher", request.url))
  }

  if (isTeacherRoute && userRole === "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/teacher/:path*", "/login"],
}
