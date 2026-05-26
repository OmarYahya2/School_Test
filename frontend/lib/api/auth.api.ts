import { client } from "./client";
import type { User } from "../store";
import { setCurrentUser } from "../store";

export async function apiSignUp(
  name: string,
  email: string,
  password: string
): Promise<User | null> {
  try {
    const result = await client.post<{ token: string; refreshToken?: string; user: User }>("/auth/register", {
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
      }
      setCurrentUser(result.user);
      return result.user;
    }
    return null;
  } catch (error) {
    console.error("Sign up failed:", error);
    return null;
  }
}

export async function apiSignIn(
  email: string,
  password: string
): Promise<User | null> {
  try {
    const result = await client.post<{ token: string; refreshToken?: string; user: User }>("/auth/login", {
      email,
      password,
    });

    if (result && result.token) {
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", result.token);
        if (result.refreshToken) {
          localStorage.setItem("refresh_token", result.refreshToken);
        }
      }
      setCurrentUser(result.user);
      return result.user;
    }
    return null;
  } catch (error) {
    console.error("Sign in failed:", error);
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
  }
  setCurrentUser(null);
}
