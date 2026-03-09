"use client"

import { supabase } from "./supabaseClient"
import type { User } from "./store"

export async function supabaseSignUp(
  name: string,
  email: string,
  password: string
): Promise<User | null> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  })

  if (error || !data.user) {
    return null
  }

  const user: User = {
    id: data.user.id,
    name: (data.user.user_metadata?.name as string) || name,
    email: data.user.email || email,
    // We never store the real password on the client
    password: "",
  }

  return user
}

export async function supabaseSignIn(
  email: string,
  password: string
): Promise<User | null> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data.user) {
    return null
  }

  const user: User = {
    id: data.user.id,
    name: (data.user.user_metadata?.name as string) || data.user.email || "",
    email: data.user.email || email,
    password: "",
  }

  return user
}

export async function supabaseSignOut(): Promise<void> {
  await supabase.auth.signOut()
}

