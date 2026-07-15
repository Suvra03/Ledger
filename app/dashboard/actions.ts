'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// --- ACCOUNTS ---

export async function createAccount(name: string, initialBalance: number = 0) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Generate random styling classes for variety
  const bgClasses = [
    'from-blue-900 to-blue-950 border-blue-800/50',
    'from-emerald-800 to-emerald-950 border-emerald-700/50',
    'from-orange-700 to-orange-950 border-orange-600/50',
    'from-purple-900 to-purple-950 border-purple-800/50',
    'from-rose-900 to-rose-950 border-rose-800/50',
  ]
  const textClasses = [
    'text-blue-300',
    'text-emerald-300',
    'text-orange-300',
    'text-purple-300',
    'text-rose-300',
  ]
  const randomIndex = Math.floor(Math.random() * bgClasses.length)

  const { data, error } = await supabase
    .from('accounts')
    .insert({
      user_id: user.id,
      name,
      balance: initialBalance,
      previous_balance: initialBalance,
      bg_class: bgClasses[randomIndex],
      text_class: textClasses[randomIndex]
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  
  revalidatePath('/dashboard')
  return data
}

export async function updateAccount(accountId: string, newName: string, addAmount: number) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get current account balance
  const { data: account } = await supabase
    .from('accounts')
    .select('balance')
    .eq('id', accountId)
    .single()

  if (!account) throw new Error('Account not found')

  const previousBalance = account.balance
  const newBalance = previousBalance + addAmount

  const { error } = await supabase
    .from('accounts')
    .update({
      name: newName,
      balance: newBalance,
      previous_balance: previousBalance
    })
    .eq('id', accountId)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/accounts/${accountId}`)
}

export async function deleteAccount(accountId: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('accounts')
    .delete()
    .eq('id', accountId)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

// --- TRANSACTIONS ---

export async function createTransaction(accountId: string, amount: number, type: 'credited' | 'debited', title: string, category: string = 'General') {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get current account to update its balance
  const { data: account } = await supabase
    .from('accounts')
    .select('balance')
    .eq('id', accountId)
    .single()

  if (!account) throw new Error('Account not found')

  const previousBalance = account.balance
  const signedAmount = type === 'credited' ? Math.abs(amount) : -Math.abs(amount)
  const newBalance = previousBalance + signedAmount

  // Create transaction
  const { error: txError } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      account_id: accountId,
      title: title || (type === 'credited' ? 'Deposit' : 'Withdrawal'),
      category: category,
      amount: signedAmount,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    })

  if (txError) throw new Error(txError.message)

  // Update account balance
  const { error: accError } = await supabase
    .from('accounts')
    .update({
      balance: newBalance,
      previous_balance: previousBalance
    })
    .eq('id', accountId)

  if (accError) throw new Error(accError.message)

  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/accounts/${accountId}`)
}

export async function verifyPasskey(email: string, pin: string) {
  const supabase = createClient()
  
  if (!pin || pin.length !== 4) {
    return { success: false, error: 'Invalid passkey' }
  }

  // Supabase passwords must be at least 6 characters, so we pad the 4-digit PIN
  const paddedPin = pin + 'ledger'

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: paddedPin,
  })

  if (error) {
    console.error("Passkey verification error:", error)
    return { success: false, error: error.message || 'Incorrect passkey' }
  }

  return { success: true }
}
