import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Wallet, ArrowUpRight, ArrowDownRight, CreditCard, Plus, LogOut, ChevronDown } from 'lucide-react'
import { logout } from '../(auth)/actions'
import AddAccountButton from './AddAccountButton'
import SidebarMenu from './SidebarMenu'

export default async function DashboardPage() {
  const supabase = createClient()

  // Get the user from Supabase auth
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const name = user.user_metadata?.full_name || 'Master'
  const initials = name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()

  // Fetch real bank accounts
  const { data: bankAccounts } = await supabase
    .from('accounts')
    .select('*')
    .order('created_at', { ascending: true })

  const accounts = bankAccounts || []
  const totalBankBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0)

  // Fetch real transactions (last 10)
  const { data: recentTransactions } = await supabase
    .from('transactions')
    .select('*, accounts(name)')
    .order('created_at', { ascending: false })
    .limit(10)
  const transactions = recentTransactions || []

  // Group transactions by month
  const groupedTransactions = transactions.reduce((acc, tx) => {
    const date = new Date(tx.created_at)
    const month = date.toLocaleString('en-US', { month: 'long' })
    const year = date.toLocaleString('en-US', { year: '2-digit' })
    const key = `${month} '${year}`
    if (!acc[key]) acc[key] = []
    acc[key].push(tx)
    return acc
  }, {} as Record<string, typeof transactions>)
  // Fetch ALL transactions for the current month to compute accurate monthly stats
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const { data: monthTransactionsData } = await supabase
    .from('transactions')
    .select('id, amount, category, created_at, title')
    .gte('created_at', firstDayOfMonth)

  const monthTransactions = monthTransactionsData || []
  let monthlyExpenses = 0
  let monthlyIncome = 0

  monthTransactions.forEach(tx => {
    if (tx.amount > 0) monthlyIncome += Number(tx.amount)
    if (tx.amount < 0) monthlyExpenses += Math.abs(Number(tx.amount))
  })

  const startingBalance = totalBankBalance - monthlyIncome + monthlyExpenses
  const currentMonthName = now.toLocaleString('en-US', { month: 'long' })

  const balance = totalBankBalance

  // Helper for INR formatting
  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-ink)] font-sans pb-20">
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 bg-gradient-to-br from-[var(--color-jade)]/5 via-transparent to-[var(--color-gold)]/5 pointer-events-none -z-10"></div>

      {/* Top Navigation */}
      <nav className="w-full bg-[var(--color-paper)] border-b border-[var(--color-rule)] px-6 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-bold tracking-tight text-[var(--color-ink)]">
          Ledger.
        </h1>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <span className="font-bold text-[var(--color-jade)] text-sm">{initials}</span>
            </div>
            <span className="text-sm font-medium text-[var(--color-ink)]">{name}</span>
          </div>

          <div className="w-px h-6 bg-[var(--color-rule)] mx-1"></div>

          <SidebarMenu monthTransactions={monthTransactions} />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pt-10">
        {/* Header */}
        <header className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-[var(--color-ink)] flex flex-col">
            <span>Welcome back,</span>
            <span className="text-4xl text-white mt-1">{name}!</span>
          </h2>
        </header>

        {/* Balance Card */}
        <div className="bg-[var(--color-paper)] rounded-3xl p-8 mb-10 shadow-xl border border-[var(--color-rule)]/50 relative group">
          <div className="absolute top-0 right-8 h-full flex items-center transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3 pointer-events-none">
            <div className="relative">
              <div className="absolute inset-0 bg-[var(--color-gold)] blur-[60px] opacity-10 rounded-full"></div>
              <svg width="160" height="160" viewBox="0 0 24 24" fill="none" stroke="url(#goldGradient)" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-30">
                <defs>
                  <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--color-gold)" />
                    <stop offset="100%" stopColor="#A8813B" />
                  </linearGradient>
                </defs>
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                <path d="M8 7h8" />
                <path d="M8 11h5" />
                <path d="M8 15h8" />
                <path d="M19 11h.01" strokeWidth="2" stroke="var(--color-gold)" />
              </svg>
            </div>
          </div>

          <div className="relative z-20">
            <details className="group/details">
              <summary className="list-none cursor-pointer select-none outline-none w-fit group/title">
                <div className="flex items-center gap-1.5 mb-2">
                  <p className="text-[var(--color-ink-soft)] font-medium group-hover/title:text-[var(--color-gold)] transition-colors">Total Balance</p>
                  <div className="text-[var(--color-ink-soft)] transition-all group-hover/title:text-[var(--color-gold)] group-open/details:-rotate-180 group-open/details:text-[var(--color-gold)]">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
                <h2 className="text-5xl font-bold text-[var(--color-ink)] tracking-tight mb-8">
                  {formatINR(balance)}
                </h2>
              </summary>

              <div className="mb-8 p-6 bg-[var(--color-surface)] border border-[var(--color-rule)] rounded-2xl animate-in fade-in slide-in-from-top-4 duration-300">
                <h4 className="text-sm font-bold mb-4 text-[var(--color-ink)] border-b border-[var(--color-rule)] pb-3">Account Breakdown</h4>
                {accounts.length === 0 ? (
                  <p className="text-sm text-[var(--color-ink-soft)]">No accounts yet.</p>
                ) : (
                  accounts.map(acc => (
                    <div key={acc.id} className="flex justify-between items-center mb-3 last:mb-0">
                      <span className="text-[var(--color-ink)] font-medium">{acc.name}</span>
                      <span className="font-bold text-[var(--color-ink)]">{formatINR(acc.balance)}</span>
                    </div>
                  ))
                )}
              </div>
            </details>
          </div>

          <div className="flex gap-4 relative z-10">
            <div className="flex-1 bg-[var(--color-surface)] rounded-2xl p-4 border border-[var(--color-rule)] flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-[var(--color-ink-soft)] font-medium">Starting Balance</p>
                <p className="font-bold text-[var(--color-ink)]">{formatINR(startingBalance)}</p>
              </div>
            </div>

            <div className="flex-1 bg-[var(--color-surface)] rounded-2xl p-4 border border-[var(--color-rule)] flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <ArrowDownRight className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-[var(--color-ink-soft)] font-medium">{currentMonthName} Expenses</p>
                <p className="font-bold text-[var(--color-ink)]">{formatINR(monthlyExpenses)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bank Accounts */}
        <div className="mb-10">
          <h3 className="text-xl font-bold text-[var(--color-ink)] mb-4">Your Accounts</h3>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {accounts.map((acc, index) => {
              const themes = [
                { bg: 'from-blue-900 to-blue-950 border-blue-800/50', text: 'text-blue-300' },
                { bg: 'from-emerald-800 to-emerald-950 border-emerald-700/50', text: 'text-emerald-300' },
                { bg: 'from-rose-900 to-rose-950 border-rose-800/50', text: 'text-rose-300' },
                { bg: 'from-purple-900 to-purple-950 border-purple-800/50', text: 'text-purple-300' },
              ]
              const theme = themes[index % 4]

              return (
                <div key={acc.id} className={`min-w-[200px] bg-gradient-to-br ${theme.bg} rounded-2xl p-5 shadow-lg flex flex-col justify-between snap-start relative overflow-hidden`}>
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full pointer-events-none"></div>
                  <div>
                    <p className={`${theme.text} text-xs font-medium mb-1`}>{acc.name}</p>
                    <p className="text-white font-bold text-xl">{formatINR(acc.balance)}</p>
                  </div>
                  <div className="mt-6 flex justify-between items-end relative z-10">
                    <Link href={`/dashboard/accounts/${acc.id}`} className="text-xs font-medium text-white/70 hover:text-white transition-colors underline underline-offset-4 decoration-white/30 hover:decoration-white/80">
                      View Details
                    </Link>
                    <div className="w-8 h-5 bg-white/20 rounded-sm"></div>
                  </div>
                </div>
              )
            })}

            <AddAccountButton />
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="flex justify-between items-end mb-6">
          <h3 className="text-2xl font-bold text-[var(--color-ink)]">Recent Activity</h3>
        </div>

        <div className="bg-[var(--color-paper)] rounded-3xl p-4 shadow-xl shadow-black/5">
          {transactions.length === 0 ? (
            <div className="p-10 text-center text-[var(--color-ink-soft)]">
              No recent activity found. Add an account and some transactions!
            </div>
          ) : (
            Object.entries(groupedTransactions).map(([monthStr, monthTransactions], mIndex, mArray) => (
              <div key={monthStr}>
                <div className="px-2 pt-2 pb-3 mb-2 border-b border-white/5">
                  <h3 className="text-xl font-bold text-[var(--color-ink)] tracking-tight">{monthStr}</h3>
                </div>
                {monthTransactions.map((tx, i) => (
                  <div
                    key={tx.id}
                    className={`flex items-center justify-between p-4 ${i !== monthTransactions.length - 1 || mIndex !== mArray.length - 1 ? 'border-b border-white/10' : ''} hover:bg-[var(--color-surface)] rounded-2xl transition-all cursor-pointer group`}
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
                        <div className="flex gap-2">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[var(--color-rule)] bg-[var(--color-surface)] text-xs text-[var(--color-ink-soft)]">
                            <CreditCard className="w-3.5 h-3.5" /> {tx.category}
                          </div>
                          {tx.accounts && (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[var(--color-rule)] bg-[var(--color-surface)] text-xs text-[var(--color-ink-soft)]">
                              <Wallet className="w-3.5 h-3.5" /> {tx.accounts.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-xl tracking-tight ${tx.amount > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount < 0 ? '-' : ''}{formatINR(Math.abs(tx.amount))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <footer className="mt-12 pb-6 text-center text-sm text-[var(--color-ink-soft)] border-t border-[var(--color-rule)] pt-6">
          <p>
            &copy; {new Date().getFullYear()} Ledger.
            <br /> Design and Developed by{' '}
            <a href="https://github.com/Suvra03" target="_blank" rel="noopener noreferrer" className="text-[var(--color-gold)] font-bold hover:text-[var(--color-gold)] transition-colors">
              Suvra Kinkar
            </a>
          </p>
        </footer>
      </div>
    </div>
  )
}
