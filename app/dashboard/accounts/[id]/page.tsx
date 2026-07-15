import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight, ArrowDownRight, CreditCard, Filter, Edit, Trash2 } from 'lucide-react'
import ActionButtons from './ActionButtons'
import TransactionFAB from './TransactionFAB'

export default async function AccountDetailsPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  // Find account in DB
  const { data: allAccounts } = await supabase
    .from('accounts')
    .select('*')
    .order('created_at', { ascending: true })
    
  const accountIndex = allAccounts?.findIndex(a => a.id === params.id) ?? -1
  const account = allAccounts?.[accountIndex > -1 ? accountIndex : 0]
  
  if (!account || accountIndex === -1) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-[var(--color-ink-soft)]">Account not found.</p>
      </div>
    )
  }

  // Fetch transactions for this account
  const { data: dbTransactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('account_id', account.id)
    .order('created_at', { ascending: false })

  const transactions = dbTransactions || []

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const themes = [
    { bg: 'from-blue-900 to-blue-950 border-blue-800/50', text: 'text-blue-300' },
    { bg: 'from-emerald-800 to-emerald-950 border-emerald-700/50', text: 'text-emerald-300' },
    { bg: 'from-rose-900 to-rose-950 border-rose-800/50', text: 'text-rose-300' },
    { bg: 'from-purple-900 to-purple-950 border-purple-800/50', text: 'text-purple-300' },
  ]
  const theme = themes[accountIndex % 4]

  const currentMonthName = new Date().toLocaleString('en-US', { month: 'long' })
  const currentYearShort = new Date().toLocaleString('en-US', { year: '2-digit' })
  const monthString = `${currentMonthName} '${currentYearShort}`

  const monthlySpend = transactions
    .filter(tx => tx.amount < 0)
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0)

  return (
    <div className="flex-1 overflow-y-auto relative pb-24">
      {/* Background Decor */}
      <div className="fixed inset-0 bg-gradient-to-br from-[var(--color-jade)]/5 via-transparent to-[var(--color-gold)]/5 pointer-events-none -z-10"></div>
      
      {/* Top Navigation */}
      <nav className="w-full bg-[var(--color-paper)] border-b border-[var(--color-rule)] px-6 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-bold tracking-tight text-[var(--color-ink)]">
          Ledger.
        </h1>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pt-10">
        
        {/* Account Header Card */}
        <div className={`bg-gradient-to-br ${theme.bg} rounded-3xl p-8 shadow-2xl flex flex-col justify-between relative overflow-hidden mb-8 border border-white/10`}>
          {/* Abstract Premium Background */}
          <div className="absolute -right-8 -top-8 w-48 h-48 bg-white/10 blur-3xl rounded-full pointer-events-none"></div>
          <div className="absolute -left-8 -bottom-8 w-40 h-40 bg-black/20 blur-2xl rounded-full pointer-events-none"></div>
          <div className="absolute right-4 -bottom-10 w-40 h-40 bg-white/5 rounded-full pointer-events-none border border-white/10"></div>
          
          <div className="relative z-10">
            <p className={`${theme.text} text-xs font-bold uppercase tracking-widest mb-2 opacity-90`}>{account.name}</p>
            <p className="text-white font-bold text-5xl tracking-tighter drop-shadow-sm">{formatINR(account.balance)}</p>
            <p className="text-white/80 text-sm font-medium mt-2 tracking-wide">Previous Balance: {formatINR(account.previous_balance)}</p>
          </div>
          <ActionButtons accountId={account.id} accountName={account.name} initialBalance={account.balance} />
        </div>
        {/* Filters and Transactions */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-bold text-[var(--color-ink)] tracking-tight">{monthString}</h3>
            <p className="text-[var(--color-ink-soft)] mt-1">You have spent <span className="text-indigo-500 font-bold">{formatINR(monthlySpend)}</span> in this month</p>
          </div>
          <button className="p-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-rule)] text-[var(--color-ink)] hover:bg-[var(--color-rule)] transition-all">
            <ArrowUpRight className="w-5 h-5" />
          </button>
        </div>

        {/* Transactions List */}
        <div className="bg-[var(--color-paper)] rounded-3xl p-4 shadow-xl shadow-black/5">
          {transactions.length === 0 ? (
            <div className="p-10 text-center text-[var(--color-ink-soft)]">
              No transactions yet for this account. Click the + button to add one!
            </div>
          ) : (
            transactions.map((tx, i) => (
              <div 
                key={tx.id} 
                className={`flex items-center justify-between p-4 ${i !== transactions.length - 1 ? 'border-b border-white/10' : ''} hover:bg-[var(--color-surface)] rounded-2xl transition-all cursor-pointer group`}
              >
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-2xl
                    ${i % 3 === 0 ? 'bg-emerald-500/10 text-emerald-500' : i % 3 === 1 ? 'bg-blue-500/10 text-blue-500' : 'bg-orange-500/10 text-orange-500'}`}
                  >
                    {tx.title.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-[var(--color-ink)] mb-1.5 text-lg group-hover:text-[var(--color-gold)] transition-colors">{tx.title}</p>
                    <div className="flex items-center gap-2 text-xs font-medium text-[var(--color-ink-soft)] mb-2.5">
                      <ArrowUpRight className="w-3.5 h-3.5 text-indigo-500" />
                      <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      </div>
                      <span>•</span>
                      <span>{tx.date}</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[var(--color-rule)] bg-[var(--color-surface)] text-xs text-[var(--color-ink-soft)]">
                      <CreditCard className="w-3.5 h-3.5" /> {tx.category}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-xl tracking-tight ${tx.amount > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount < 0 ? '-' : ''}{formatINR(Math.abs(tx.amount))}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <TransactionFAB accountId={account.id} currentBalance={account.balance} />
    </div>
  )
}
