'use client'

import { useState, useTransition } from 'react'
import { Plus } from 'lucide-react'
import { createAccount } from './actions'
import { useRouter } from 'next/navigation'

export default function AddAccountButton() {
  const [showModal, setShowModal] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const [name, setName] = useState('')
  const [balance, setBalance] = useState('')

  const handleAdd = async () => {
    if (!name.trim()) return

    startTransition(async () => {
      try {
        const parsedBalance = parseFloat(balance) || 0
        const newAccount = await createAccount(name, parsedBalance)
        if (newAccount) {
          setShowModal(false)
          router.push(`/dashboard/accounts/${newAccount.id}`)
        }
      } catch (e: any) {
        alert("Failed to create account: " + e.message)
      }
    })
  }

  return (
    <>
      <div 
        onClick={() => setShowModal(true)}
        className="min-w-[200px] bg-[var(--color-surface)] rounded-2xl p-5 shadow-sm border-2 border-dashed border-[var(--color-rule)] flex flex-col items-center justify-center snap-start cursor-pointer hover:bg-[var(--color-rule)]/20 hover:border-[var(--color-gold)] transition-colors group"
      >
        <div className="w-10 h-10 rounded-full bg-[var(--color-gold)]/10 text-[var(--color-gold)] flex items-center justify-center mb-3 group-hover:bg-[var(--color-gold)] group-hover:text-black transition-colors">
          <Plus className="w-5 h-5" />
        </div>
        <p className="text-sm font-medium text-[var(--color-ink)]">Add Account</p>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[var(--color-paper)] border border-[var(--color-rule)] rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-[var(--color-ink)] mb-6 text-center">Add New Account</h3>
            
            <div className="space-y-5 mb-8">
              <div>
                <label className="block text-sm font-medium text-[var(--color-ink-soft)] mb-1.5">Bank Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Axis Bank" 
                  className="w-full bg-[var(--color-surface)] border border-[var(--color-rule)] rounded-xl px-4 py-3 text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition-shadow"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--color-ink-soft)] mb-1.5">Initial Balance</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-ink-soft)] font-medium">₹</span>
                  <input 
                    type="number" 
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    placeholder="0.00" 
                    className="w-full bg-[var(--color-surface)] border border-[var(--color-rule)] rounded-xl pl-9 pr-4 py-3 text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition-shadow"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowModal(false)}
                disabled={isPending}
                className="flex-1 py-3 bg-[var(--color-surface)] text-[var(--color-ink)] border border-[var(--color-rule)] font-bold rounded-xl hover:bg-[var(--color-rule)] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleAdd}
                disabled={isPending || !name.trim()}
                className="flex-1 py-3 bg-[var(--color-gold)] text-black font-bold rounded-xl shadow-lg hover:bg-[#d4b060] transition-colors disabled:opacity-50 disabled:bg-[var(--color-rule)]"
              >
                {isPending ? 'Creating...' : 'Add Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
