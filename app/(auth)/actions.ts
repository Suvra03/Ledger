'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = createClient()
  
  const email = formData.get('email') as string
  const pin = formData.get('pin') as string
  
  if (!email) {
    return redirect('/login?message=Email is required')
  }

  if (!pin || pin.length !== 4) {
    return redirect(`/login?email=${encodeURIComponent(email)}&message=Invalid PIN`)
  }

  // Supabase passwords must be at least 6 characters, so we pad the 4-digit PIN
  const paddedPin = pin + 'ledger'

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: paddedPin,
  })

  if (error) {
    console.error("Login error:", error)
    return redirect(`/login?email=${encodeURIComponent(email)}&message=${encodeURIComponent(error.message || 'Could not authenticate user')}`)
  }

  cookies().set('just_logged_in', 'true', { maxAge: 10, path: '/', httpOnly: false })

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = createClient()
  
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const pin = formData.get('pin') as string
  const confirmPin = formData.get('confirmPin') as string

  if (!email || !name) {
    return redirect('/register?message=Name and email are required')
  }

  if (!pin || pin.length !== 4 || pin !== confirmPin) {
    return redirect('/register?message=Invalid or mismatched PIN')
  }

  const paddedPin = pin + 'ledger'

  const { error } = await supabase.auth.signUp({
    email,
    password: paddedPin,
    options: {
      data: {
        full_name: name
      }
    }
  })

  if (error) {
    console.error("Signup error:", error)
    return redirect(`/register?message=${encodeURIComponent(error.message || 'Could not register user')}`)
  }

  cookies().set('just_logged_in', 'true', { maxAge: 10, path: '/', httpOnly: false })

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function logoutToPasskey(email: string) {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect(`/login?email=${encodeURIComponent(email)}&message=Session locked. Please enter your passkey.`)
}
