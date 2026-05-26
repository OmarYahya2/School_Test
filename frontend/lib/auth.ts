"use client"

import { apiSignUp, apiSignIn, apiSignOut } from "./api/auth.api"
import type { User } from "./store"

export async function supabaseSignUp(
  name: string,
  email: string,
  password: string
): Promise<User | null> {
  return apiSignUp(name, email, password)
}

export async function supabaseSignIn(
  email: string,
  password: string
): Promise<User | null> {
  return apiSignIn(email, password)
}

export async function supabaseSignOut(): Promise<void> {
  return apiSignOut()
}


