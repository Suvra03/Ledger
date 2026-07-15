import Link from 'next/link';
import { KeyRound, Mail } from 'lucide-react';
import { login } from '../actions';

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message: string }
}) {
  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] flex flex-col font-sans">

      {/* TOP SECTION (Fluid Blobs & Wave) */}
      <div className="relative h-[35vh] min-h-[250px] bg-[var(--color-surface)] flex flex-col items-center justify-center overflow-hidden">

        {/* Abstract Blobs and Top Wave (Darker Shade overlay) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          preserveAspectRatio="xMidYMid slice"
          viewBox="0 0 800 400"
        >
          {/* Top wavy shape */}
          <path fill="rgba(0,0,0,0.25)" d="M0,0 L800,0 L800,120 C600,180 300,50 0,150 Z" />

          {/* Floating Blobs */}
          <circle cx="650" cy="80" r="30" fill="rgba(0,0,0,0.25)" />
          <circle cx="550" cy="140" r="15" fill="rgba(0,0,0,0.25)" />
          <circle cx="600" cy="220" r="45" fill="rgba(0,0,0,0.25)" />
          <circle cx="150" cy="300" r="20" fill="rgba(0,0,0,0.25)" />
          <circle cx="250" cy="330" r="50" fill="rgba(0,0,0,0.25)" />
          <circle cx="680" cy="320" r="25" fill="rgba(0,0,0,0.25)" />
          <circle cx="730" cy="200" r="18" fill="rgba(0,0,0,0.25)" />
        </svg>

        {/* Ambient background glow just to keep it rich */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-jade)]/10 via-transparent to-[var(--color-gold)]/5 pointer-events-none"></div>

        {/* Logo / Welcome Text */}
        <div className="relative z-10 text-center -mt-8">
          <h1 className="font-[family-name:var(--font-fraunces)] text-5xl font-bold tracking-tight text-[var(--color-ink)]">
            Ledger.
          </h1>
          <p className="text-[var(--color-ink-soft)] text-xl mt-1 font-medium">
            Welcome back
          </p>
        </div>

        {/* The Wavy Divider (Bottom) */}
        <svg
          viewBox="0 0 1440 100"
          className="absolute bottom-[-1px] left-0 w-full h-[40px] sm:h-[70px] drop-shadow-sm"
          preserveAspectRatio="none"
        >
          <path
            fill="var(--color-paper)"
            d="M0,20 C480,100 960,0 1440,50 L1440,100 L0,100 Z"
          ></path>
        </svg>
      </div>

      {/* BOTTOM SECTION (Form) */}
      <div className="flex-1 bg-[var(--color-paper)] px-8 pt-4 pb-12 flex flex-col max-w-md w-full mx-auto">

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[var(--color-ink)] mb-1">Sign in</h2>
        </div>

        {!searchParams?.email ? (
          <form action="/login" method="GET" className="flex flex-col gap-6 flex-1">
            {/* Error Message Display */}
            {searchParams?.message && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm font-medium text-center">
                {searchParams.message}
              </div>
            )}

            {/* Email Input */}
            <div className="flex flex-col group/input">
              <label className="text-xs font-semibold text-[var(--color-ink-soft)] mb-2">
                Email Address
              </label>
              <div className="relative flex items-center border-b border-[var(--color-rule)] pb-2 transition-colors focus-within:border-[var(--color-gold)]">
                <Mail className="w-5 h-5 text-[var(--color-ink-soft)] mr-3 group-focus-within/input:text-[var(--color-gold)] transition-colors" strokeWidth={2} />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="jane@doe.com"
                  className="w-full bg-transparent outline-none text-xl font-medium placeholder:text-[var(--color-ink-soft)]/50 text-[var(--color-ink)]"
                />
              </div>
            </div>

            <div className="mt-8">
              <button
                type="submit"
                className="w-full py-4 bg-[var(--color-jade)] text-[#0B0E0C] rounded-2xl font-bold text-lg shadow-lg hover:shadow-[var(--color-jade)]/20 hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2 group/btn"
              >
                Next
              </button>
            </div>
          </form>
        ) : (
          <form action={login} className="flex flex-col gap-6 flex-1">
            <input type="hidden" name="email" value={searchParams.email} />
            
            <div className="text-center mb-2">
              <p className="text-sm text-[var(--color-ink-soft)]">
                Signing in as <span className="font-semibold text-[var(--color-ink)]">{searchParams.email}</span>
              </p>
              <Link href="/login" className="text-xs text-[var(--color-rust)] hover:text-[var(--color-gold)] transition-colors underline mt-1 block">
                Not you?
              </Link>
            </div>

            {/* Error Message Display */}
            {searchParams?.message && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm font-medium text-center">
                {searchParams.message}
              </div>
            )}

            {/* Passkey Input */}
            <div className="flex flex-col group/input">
              <label className="text-xs font-semibold text-[var(--color-ink-soft)] mb-2">
                Passkey
              </label>
              <div className="relative flex items-center border-b border-[var(--color-rule)] pb-2 transition-colors focus-within:border-[var(--color-gold)]">
                <KeyRound className="w-5 h-5 text-[var(--color-ink-soft)] mr-3 group-focus-within/input:text-[var(--color-gold)] transition-colors" strokeWidth={2} />
                <input
                  type="password"
                  name="pin"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  required
                  placeholder="Enter your passkey!"
                  className="w-full bg-transparent outline-none text-xl tracking-widest font-medium placeholder:text-[var(--color-ink-soft)]/50 placeholder:tracking-normal text-[var(--color-ink)]"
                />
              </div>
            </div>

            <div className="mt-8">
              <button
                type="submit"
                className="w-full py-4 bg-[var(--color-jade)] text-[#0B0E0C] rounded-2xl font-bold text-lg shadow-lg hover:shadow-[var(--color-jade)]/20 hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2 group/btn"
              >
                Login
              </button>
            </div>
          </form>
        )}

        {/* Footer Link */}
        <div className="mt-auto pt-8 text-center">
          <p className="text-sm text-[var(--color-ink-soft)]">
            Don't have a passkey?{' '}
            <Link href="/register" className="font-bold text-[var(--color-rust)] hover:text-[var(--color-gold)] transition-colors">
              Sign up
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}