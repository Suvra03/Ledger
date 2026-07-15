'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ArrowUpRight, ArrowDownRight, Tag, X } from 'lucide-react'

type Transaction = {
  id: string
  amount: number
  category: string
  created_at: string
  title?: string
}

export default function Calendar({ monthTransactions }: { monthTransactions: Transaction[] }) {
  // We'll focus on the current month for simplicity
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<number | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay()

  const monthName = currentDate.toLocaleString('en-US', { month: 'long' })

  // Find days in this month where spending occurred
  const spendDays = new Set(
    monthTransactions
      .filter(tx => tx.amount < 0)
      .map(tx => {
        const txDate = new Date(tx.created_at)
        if (txDate.getMonth() === month && txDate.getFullYear() === year) {
          return txDate.getDate()
        }
        return null
      })
      .filter(Boolean)
  )

  const today = new Date()
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year
  const currentDay = today.getDate()

  const days = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>)
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = isCurrentMonth && d === currentDay
    const hasSpend = spendDays.has(d)
    const isSelected = selectedDate === d
    
    days.push(
      <div 
        key={d} 
        onClick={() => setSelectedDate(prev => prev === d ? null : d)}
        className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-medium relative cursor-pointer transition-colors ${
          isToday 
            ? 'bg-[var(--color-gold)] text-black font-bold' 
            : isSelected
              ? 'bg-[var(--color-ink)] text-[var(--color-paper)] font-bold'
              : 'text-[var(--color-ink)] hover:bg-[var(--color-rule)]'
        }`}
      >
        {d}
        {hasSpend && !isToday && !isSelected && (
          <div className="absolute bottom-1 w-1 h-1 rounded-full bg-red-500"></div>
        )}
      </div>
    )
  }

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-rule)] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-[var(--color-ink)]">
          <CalendarIcon className="w-4 h-4 text-[var(--color-ink-soft)]" />
          <h3 className="text-sm font-bold tracking-tight">{monthName} {year}</h3>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handlePrevMonth} className="p-1 rounded-md hover:bg-[var(--color-rule)] text-[var(--color-ink-soft)] transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={handleNextMonth} className="p-1 rounded-md hover:bg-[var(--color-rule)] text-[var(--color-ink-soft)] transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-[10px] font-bold text-[var(--color-ink-soft)] uppercase tracking-wider">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 justify-items-center mb-2">
        {days}
      </div>

      {selectedDate && (
        <div className="mt-4 pt-4 border-t border-[var(--color-rule)] animate-in fade-in slide-in-from-top-2">
          <h4 className="text-xs font-bold text-[var(--color-ink-soft)] uppercase tracking-wider mb-3">
            Transactions for {monthName} {selectedDate}
          </h4>
          {(() => {
            const dayTxs = monthTransactions.filter(tx => {
              const txDate = new Date(tx.created_at)
              return txDate.getDate() === selectedDate && txDate.getMonth() === month && txDate.getFullYear() === year
            })

            if (dayTxs.length === 0) {
              return <p className="text-xs text-[var(--color-ink-soft)] italic text-center py-2">No transactions on this day.</p>
            }

            return (
              <div className="bg-[var(--color-paper)] rounded-2xl border border-[var(--color-rule)] shadow-sm overflow-hidden mt-2">
                {dayTxs.map((tx, i, arr) => (
                  <div key={tx.id} className={`flex justify-between items-center p-3 hover:bg-[var(--color-surface)] transition-colors ${i !== arr.length - 1 ? 'border-b border-[var(--color-rule)]' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${tx.amount > 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                        {tx.amount > 0 ? <ArrowUpRight className="w-4 h-4 text-emerald-500" /> : <ArrowDownRight className="w-4 h-4 text-red-500" />}
                      </div>
                      <div>
                        <p className="font-bold text-[var(--color-ink)] text-sm leading-tight">{tx.title || 'Transaction'}</p>
                        <div className="inline-flex items-center gap-1 mt-1">
                          <Tag className="w-3 h-3 text-[var(--color-ink-soft)]" />
                          <span className="text-[10px] uppercase font-bold text-[var(--color-ink-soft)] tracking-wider">{tx.category}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`font-bold text-sm tracking-tight ${tx.amount > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount < 0 ? '-' : ''}{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.abs(tx.amount))}
                    </span>
                  </div>
                ))}
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
