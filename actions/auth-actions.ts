/*
<ai_context>
Server actions for authentication operations (login, signup, signout).
</ai_context>
*/

"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ActionState } from "@/types"

export async function loginAction(
  formData: FormData
): Promise<ActionState<undefined>> {
  const supabase = await createClient()

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string
  }

  const redirectPath = (formData.get("redirect") as string) || "/papers"

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return {
      isSuccess: false,
      message: error.message
    }
  }

  revalidatePath("/", "layout")
  redirect(redirectPath)
}

export async function signupAction(
  formData: FormData
): Promise<ActionState<undefined>> {
  const supabase = await createClient()

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string
  }

  const { error } = await supabase.auth.signUp({
    ...data,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
    }
  })

  if (error) {
    return {
      isSuccess: false,
      message: error.message
    }
  }

  revalidatePath("/", "layout")
  return {
    isSuccess: true,
    message: "Check your email to confirm your account",
    data: undefined
  }
}

export async function signoutAction(): Promise<ActionState<undefined>> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    return {
      isSuccess: false,
      message: error.message
    }
  }

  revalidatePath("/", "layout")
  redirect("/auth/login")
}

export async function getCurrentUserAction() {
  const supabase = await createClient()

  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}



