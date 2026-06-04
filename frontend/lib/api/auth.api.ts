import { client } from "./client";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  teacherId?: string;
  createdAt: string;
}

function setAuthCookies(token: string, role: string) {
  if (typeof window === "undefined") return
  const secure = window.location.protocol === "https:" ? "; Secure" : ""
  document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}${secure}`
  document.cookie = `user_role=${role}; path=/; max-age=${60 * 60 * 24 * 7}${secure}`
}

function clearAuthCookies() {
  if (typeof window === "undefined") return
  document.cookie = "auth_token=; path=/; max-age=0"
  document.cookie = "user_role=; path=/; max-age=0"
}

export async function apiSignUp(
  name: string,
  email: string,
  password: string
): Promise<AuthUser | null> {
  try {
    const result = await client.post<{ token: string; refreshToken?: string; user: AuthUser }>("/auth/register", {
      name,
      email,
      password,
    });

    if (result && result.token) {
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", result.token);
        if (result.refreshToken) {
          localStorage.setItem("refresh_token", result.refreshToken);
        }
        setAuthCookies(result.token, result.user.role);
      }
      return result.user;
    }
    return null;
  } catch {
    return null;
  }
}

export async function apiSignIn(
  email: string,
  password: string
): Promise<AuthUser | null> {
  try {
    const result = await client.post<{ token: string; refreshToken?: string; user: AuthUser }>("/auth/login", {
      email,
      password,
    });

    if (result && result.token) {
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", result.token);
        if (result.refreshToken) {
          localStorage.setItem("refresh_token", result.refreshToken);
        }
        setAuthCookies(result.token, result.user.role);
      }
      return result.user;
    }
    return null;
  } catch {
    return null;
  }
}

export async function apiSignOut(): Promise<void> {
  if (typeof window !== "undefined") {
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      client.post("/auth/logout", { refreshToken }).catch(() => {});
    }
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
    clearAuthCookies();
  }
}
