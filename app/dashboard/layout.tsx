import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import SessionEnforcer from './SessionEnforcer'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  
  // Verify Supabase authentication
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !user.email) {
    redirect('/login')
  }

  return (
    <SessionEnforcer email={user.email}>
      {children}
    </SessionEnforcer>
  )
}
