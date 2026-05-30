"use client"

import { apiSignUp, apiSignIn, apiSignOut, type AuthUser } from "./api/auth.api"

export async function supabaseSignUp(
  name: string,
  email: string,
  password: string
): Promise<AuthUser | null> {
  return apiSignUp(name, email, password)
}

export async function supabaseSignIn(
  email: string,
  password: string
): Promise<AuthUser | null> {
  return apiSignIn(email, password)
}

export async function supabaseSignOut(): Promise<void> {
  return apiSignOut()
}


