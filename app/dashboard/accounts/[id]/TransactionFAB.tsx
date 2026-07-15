'use client'

import { useState, useTransition } from 'react'
import { Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { createTransaction } from '../../actions'

export default function TransactionFAB({ accountId, currentBalance }: { accountId: string, currentBalance: number }) {
  const [showModal, setShowModal] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [amount, setAmount] = useState('')
  const [title, setTitle] = useState('')
  const [type, setType] = useState<'credited' | 'debited'>('debited')
  const [category, setCategory] = useState('General')
  const [isCustomCategory, setIsCustomCategory] = useState(false)
  const predefinedTags = ['Grocery', 'Rent', 'Water', 'Electricity', 'Fuel', 'Cashout', 'EMI', 'Loan']

  const parsedAmount = parseFloat(amount) || 0
  const newBalance = type === 'credited' ? currentBalance + parsedAmount : currentBalance - parsedAmount

  const formatINR = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)

  const handleAddTransaction = () => {
    if (parsedAmount <= 0) return
    startTransition(async () => {
      try {
        await createTransaction(accountId, parsedAmount, type, title, category || 'General')
        setShowModal(false)
        setAmount('')
        setTitle('')
        setType('debited')
        setCategory('General')
        setIsCustomCategory(false)
      } catch (e: any) {
        alert(e.message)
      }
    })
  }

  return (
    <>
      <button
        onClick={() => {
          setAmount('')
          setTitle('')
          setType('debited')
          setCategory('General')
          setIsCustomCategory(false)
          setShowModal(true)
        }}
        className="fixed bottom-8 right-8 w-16 h-16 bg-[var(--color-gold)] hover:bg-[var(--color-jade)] text-black rounded-full flex items-center justify-center shadow-xl shadow-[var(--color-gold)]/20 hover:shadow-[var(--color-jade)]/20 hover:-translate-y-1 transition-all group z-50"
      >
        <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[var(--color-paper)] border border-[var(--color-rule)] rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-[var(--color-ink)] mb-6 text-center">Add Transaction</h3>

            <div className="space-y-5 mb-6">
              <div>
                <label className="block text-sm font-medium text-[var(--color-ink-soft)] mb-2">Paid To / Received From</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. UPI, Amazon"
                  className="w-full bg-[var(--color-surface)] border border-[var(--color-rule)] rounded-xl px-4 py-3 text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] transition-shadow"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-ink-soft)] mb-2">Category Tags</label>
                <div className="flex flex-wrap gap-2">
                  {predefinedTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => { setCategory(tag); setIsCustomCategory(false) }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${category === tag && !isCustomCategory ? 'bg-[var(--color-gold)] text-black border-[var(--color-gold)]' : 'bg-[var(--color-surface)] text-[var(--color-ink-soft)] border-[var(--color-rule)] hover:bg-[var(--color-rule)]'}`}
                    >
                      {tag}
                    </button>
                  ))}
                  {isCustomCategory ? (
                    <input
                      type="text"
                      autoFocus
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="Custom tag..."
                      className="px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-gold)] rounded-lg text-sm text-[var(--color-ink)] focus:outline-none w-28"
                    />
                  ) : (
                    <button
                      onClick={() => { setCategory(''); setIsCustomCategory(true) }}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium bg-[var(--color-surface)] text-[var(--color-ink-soft)] border border-dashed border-[var(--color-rule)] hover:border-[var(--color-ink-soft)] transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-ink-soft)] mb-2">Type</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setType('debited')}
                    className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all border ${type === 'debited' ? 'bg-red-500/10 text-red-500 border-red-500/30' : 'bg-[var(--color-surface)] text-[var(--color-ink-soft)] border-[var(--color-rule)] hover:bg-[var(--color-rule)]'}`}
                  >
                    <ArrowUpRight className="w-4 h-4" /> Debited
                  </button>
                  <button
                    onClick={() => setType('credited')}
                    className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all border ${type === 'credited' ? 'bg-[var(--color-jade)]/10 text-[var(--color-jade)] border-[var(--color-jade)]/30' : 'bg-[var(--color-surface)] text-[var(--color-ink-soft)] border-[var(--color-rule)] hover:bg-[var(--color-rule)]'}`}
                  >
                    <ArrowDownRight className="w-4 h-4" /> Credited
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-1.5">
                  <label className="block text-sm font-medium text-[var(--color-ink-soft)]">Amount</label>
                  <span className="text-xs text-[var(--color-ink-soft)] font-medium">Current: {formatINR(currentBalance)}</span>
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
              <span className="text-sm font-medium text-[var(--color-ink-soft)]">Projected Balance</span>
              <span className={`text-xl font-bold ${type === 'credited' ? 'text-[var(--color-jade)]' : 'text-[var(--color-ink)]'}`}>
                {formatINR(newBalance)}
              </span>
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
                onClick={handleAddTransaction}
                disabled={isPending || parsedAmount <= 0}
                className="flex-1 py-3 bg-[var(--color-gold)] text-black font-bold rounded-xl shadow-lg hover:bg-[#d4b060] transition-colors disabled:opacity-50 disabled:bg-[var(--color-rule)]"
              >
                {isPending ? 'Adding...' : 'Add Transaction'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
