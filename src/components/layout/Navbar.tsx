import Link from 'next/link';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200/80 bg-stone-50/90 backdrop-blur-md dark:border-stone-800/80 dark:bg-stone-950/90 transition-colors">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link 
          href="/" 
          className="group flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-sm font-bold text-lg group-hover:scale-105 transition-transform">
            P
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-stone-900 dark:text-stone-100">
              Planora<span className="text-amber-600 dark:text-amber-500">.ai</span>
            </span>
            <span className="text-[10px] font-medium tracking-wide text-stone-500 dark:text-stone-400">
              Every celebration, brilliantly planned.
            </span>
          </div>
        </Link>

        <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600 dark:text-stone-300">
          <a 
            href="#categories" 
            className="hover:text-stone-900 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-md px-1 py-0.5"
          >
            Event Types
          </a>
          <a 
            href="#capabilities" 
            className="hover:text-stone-900 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-md px-1 py-0.5"
          >
            Core Capabilities
          </a>
          <a 
            href="#architecture" 
            className="hover:text-stone-900 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-md px-1 py-0.5"
          >
            Architecture
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <span 
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-amber-100/80 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
            role="status"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-600 dark:bg-amber-400 animate-pulse" />
            Phase 3: GenAI Planner
          </span>
          <a
            href="/plan"
            className="inline-flex items-center justify-center rounded-lg bg-stone-900 px-3.5 py-2 text-xs font-semibold text-stone-50 shadow-sm transition hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"
          >
            Plan Event
          </a>
        </div>
      </div>
    </header>
  );
}

