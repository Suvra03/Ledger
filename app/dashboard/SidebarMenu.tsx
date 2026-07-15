'use client'

import { useState, useEffect } from 'react'
import { Menu, X, LogOut, Wallet, TrendingDown, Tag, PenLine } from 'lucide-react'
import { logout } from '../(auth)/actions'
import Calendar from './Calendar'

type Transaction = {
  id: string
  amount: number
  category: string
  created_at: string
}

export default function SidebarMenu({ monthTransactions }: { monthTransactions: Transaction[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [notes, setNotes] = useState('')
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(false)

  useEffect(() => {
    const savedNotes = localStorage.getItem('ledger_notes')
    if (savedNotes) {
      setNotes(savedNotes)
    }
  }, [])

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value)
    localStorage.setItem('ledger_notes', e.target.value)
  }

  // Calculate Daily and Monthly Expenses
  const todayDateString = new Date().toLocaleDateString('en-US')
  
  let dailyExpense = 0
  let monthlyExpense = 0
  const predefinedTags = ['General', 'Grocery', 'Rent', 'Water', 'Electricity', 'Fuel', 'Cashout', 'EMI', 'Loan']
  const categoryBreakdown: Record<string, number> = {}
  
  predefinedTags.forEach(tag => {
    categoryBreakdown[tag] = 0
  })

  monthTransactions.forEach(tx => {
    if (tx.amount < 0) {
      const expenseAmount = Math.abs(tx.amount)
      monthlyExpense += expenseAmount

      const txDateString = new Date(tx.created_at).toLocaleDateString('en-US')
      if (txDateString === todayDateString) {
        dailyExpense += expenseAmount
      }

      if (!categoryBreakdown[tx.category]) {
        categoryBreakdown[tx.category] = 0
      }
      categoryBreakdown[tx.category] += expenseAmount
    }
  })

  // Sort categories by highest spend
  const sortedCategories = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])

  const formatINR = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-lg flex items-center justify-center text-[var(--color-ink)] hover:text-[var(--color-gold)] transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-[var(--color-paper)] border-l border-[var(--color-rule)] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex justify-between items-center p-6 border-b border-[var(--color-rule)]">
          <h2 className="text-xl font-bold text-[var(--color-ink)] font-[family-name:var(--font-fraunces)] tracking-tight">Analytics & Notes</h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-full bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Daily & Monthly Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[var(--color-surface)] border border-[var(--color-rule)] rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2 text-[var(--color-ink-soft)]">
                <Wallet className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Today</span>
              </div>
              <p className="text-2xl font-bold text-[var(--color-ink)] tracking-tight">{formatINR(dailyExpense)}</p>
            </div>
            <div className="bg-[var(--color-surface)] border border-[var(--color-rule)] rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2 text-red-500/80">
                <TrendingDown className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">This Month</span>
              </div>
              <p className="text-2xl font-bold text-red-500 tracking-tight">{formatINR(monthlyExpense)}</p>
            </div>
          </div>

          {/* Monthly Calendar */}
          <Calendar monthTransactions={monthTransactions} />

          {/* Category Breakdown */}
          <div>
            <div className="flex items-center gap-2 mb-4 text-[var(--color-ink-soft)] border-b border-[var(--color-rule)] pb-2">
              <Tag className="w-4 h-4" />
              <h3 className="text-sm font-bold uppercase tracking-wider">Where you've spent</h3>
            </div>
            
            {sortedCategories.length === 0 ? (
              <p className="text-sm text-[var(--color-ink-soft)]">No expenses this month yet.</p>
            ) : (
              <div className="space-y-4">
                {(isCategoriesExpanded ? sortedCategories : sortedCategories.slice(0, 3)).map(([cat, amount]) => {
                  const percentage = monthlyExpense > 0 ? Math.round((amount / monthlyExpense) * 100) : 0
                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium text-[var(--color-ink)]">{cat}</span>
                        <span className="font-bold text-[var(--color-ink)]">{formatINR(amount)} <span className="text-[var(--color-ink-soft)] font-normal ml-1">({percentage}%)</span></span>
                      </div>
                      <div className="w-full h-2 bg-[var(--color-surface)] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[var(--color-gold)] rounded-full" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
                {sortedCategories.length > 3 && (
                  <button 
                    onClick={() => setIsCategoriesExpanded(!isCategoriesExpanded)}
                    className="w-full py-2.5 text-xs font-bold text-[var(--color-ink)] bg-[var(--color-surface)] hover:bg-[var(--color-rule)] transition-colors text-center border border-[var(--color-rule)] rounded-xl mt-2 flex items-center justify-center"
                  >
                    {isCategoriesExpanded ? 'Show Less' : `Show All Categories`}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Quick Notes */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-4 text-[var(--color-ink-soft)] border-b border-[var(--color-rule)] pb-2">
              <PenLine className="w-4 h-4" />
              <h3 className="text-sm font-bold uppercase tracking-wider">Quick Notes</h3>
            </div>
            <textarea 
              value={notes}
              onChange={handleNotesChange}
              placeholder="Jot down anything important... (saves automatically)"
              className="w-full flex-1 min-h-[150px] bg-[var(--color-surface)] border border-[var(--color-rule)] rounded-2xl p-4 text-[var(--color-ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)] resize-none"
            />
          </div>
        </div>

        {/* Footer with Logout */}
        <div className="p-6 border-t border-[var(--color-rule)] bg-[var(--color-surface)]">
          <form action={logout}>
            <button type="submit" className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-colors">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
