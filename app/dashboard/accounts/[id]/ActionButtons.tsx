'use client'

import { useState, useTransition } from 'react'
import { Edit, Trash2 } from 'lucide-react'
import { updateAccount, deleteAccount } from '../../actions'

export default function ActionButtons({ accountId, accountName = '', initialBalance = 0 }: { accountId: string, accountName?: string, initialBalance?: number }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [isPending, startTransition] = useTransition()
  
  const [name, setName] = useState(accountName)
  const [amount, setAmount] = useState('')
  
  const parsedAmount = parseFloat(amount) || 0
  const newTotal = initialBalance + parsedAmount

  const formatINR = (value: number) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)

  const handleUpdate = () => {
    startTransition(async () => {
      try {
        await updateAccount(accountId, name, parsedAmount)
        setShowEdit(false)
      } catch (e: any) {
        alert(e.message)
      }
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteAccount(accountId)
      } catch (e: any) {
        alert(e.message)
      }
    })
  }

  return (
    <>
      <div className="mt-12 flex justify-end gap-3 items-end relative z-10">
        <button
          onClick={() => {
            setName(accountName)
            setAmount('')
            setShowEdit(true)
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white text-xs font-bold border border-white/10 shadow-sm"
        >
          <Edit className="w-3.5 h-3.5" /> Edit
        </button>
        <button
          onClick={() => setShowConfirm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/40 hover:bg-red-500/60 transition-colors text-white text-xs font-bold border border-red-500/30 shadow-sm"
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>
      </div>

      {/* Edit Account Modal */}
      {showEdit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[var(--color-paper)] border border-[var(--color-rule)] rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-[var(--color-ink)] mb-6 text-center">Edit Account</h3>

            <div className="space-y-5 mb-6">
              <div>
                <label className="block text-sm font-medium text-[var(--color-ink-soft)] mb-1.5">Account Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. HDFC Bank"
                  className="w-full bg-[var(--color-surface)] border border-[var(--color-rule)] rounded-xl px-4 py-3 text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition-shadow"
                />
              </div>
              <div>
                <div className="flex justify-between items-end mb-1.5">
                  <label className="block text-sm font-medium text-[var(--color-ink-soft)]">Add Amount</label>
                  <span className="text-xs text-[var(--color-ink-soft)] font-medium">Previous: {formatINR(initialBalance)}</span>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-ink-soft)] font-medium">₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-[var(--color-surface)] border border-[var(--color-rule)] rounded-xl pl-9 pr-4 py-3 text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition-shadow"
                  />
                </div>
              </div>
            </div>

            <div className="bg-[var(--color-surface)] border border-[var(--color-rule)] rounded-xl p-4 flex justify-between items-center mb-8">
              <span className="text-sm font-medium text-[var(--color-ink-soft)]">New Total Balance</span>
              <span className="text-xl font-bold text-[var(--color-gold)]">{formatINR(newTotal)}</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowEdit(false)}
                disabled={isPending}
                className="flex-1 py-3 bg-[var(--color-surface)] text-[var(--color-ink)] border border-[var(--color-rule)] font-bold rounded-xl hover:bg-[var(--color-rule)] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={isPending}
                className="flex-1 py-3 bg-[var(--color-ink)] text-[var(--color-paper)] font-bold rounded-xl shadow-lg hover:bg-[var(--color-ink-soft)] transition-colors disabled:opacity-50"
              >
                {isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[var(--color-paper)] border border-[var(--color-rule)] rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-5 border border-red-500/20 text-red-500">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[var(--color-ink)] mb-2">Delete Account</h3>
            <p className="text-[var(--color-ink-soft)] text-sm mb-8 leading-relaxed">
              Are you sure you want to delete this account?
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isPending}
                className="flex-1 py-3 bg-[var(--color-surface)] text-[var(--color-ink)] border border-[var(--color-rule)] font-bold rounded-xl hover:bg-[var(--color-rule)] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl shadow-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {isPending ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
