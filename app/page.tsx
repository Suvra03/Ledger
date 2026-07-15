import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] flex flex-col items-center justify-center font-sans relative overflow-hidden">

      {/* TOP SECTION (Fluid Blobs & Wave Background) */}
      <div className="absolute top-0 left-0 w-full h-[45vh] min-h-[250px] bg-[var(--color-surface)] overflow-hidden pointer-events-none">
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

      {/* FOREGROUND CONTENT */}
      <div className="relative z-10 px-8 flex flex-col items-center justify-center w-full max-w-md mx-auto">
        <div className="mb-10 text-center mt-8">
          <h1 className="font-[family-name:var(--font-fraunces)] text-6xl font-bold tracking-tight text-[var(--color-ink)] drop-shadow-lg">
            Ledger.
          </h1>
          <p className="text-[var(--color-ink-soft)] text-xl mt-3 font-medium">
            Your personal financial statistics!
          </p>
        </div>

        <div className="flex flex-col gap-6 items-center">
          <Link
            href="/login"
            className="w-56 py-3 bg-[var(--color-jade)] text-[#0B0E0C] rounded-xl font-bold text-base shadow-lg hover:shadow-[var(--color-jade)]/20 hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2 group/btn"
          >
            Continue
          </Link>
        </div>
      </div>

    </div>
  );
}