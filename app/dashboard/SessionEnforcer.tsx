'use client'

import { useEffect, useState } from 'react'
import { logoutToPasskey } from '@/app/(auth)/actions'

export default function SessionEnforcer({ children, email }: { children: React.ReactNode, email: string }) {
  const [valid, setValid] = useState(false)

  useEffect(() => {
    const justLoggedIn = document.cookie.includes('just_logged_in=true')
    
    if (justLoggedIn) {
      setValid(true)
    } else {
      // If the handoff cookie is missing (e.g. on refresh or new tab), log out and redirect to passkey entry
      logoutToPasskey(email)
    }
  }, [email])

  if (!valid) return null

  return <>{children}</>
}
