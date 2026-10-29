export function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-stone-50 py-12 dark:border-stone-800 dark:bg-stone-950 transition-colors">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-600 text-white font-bold text-sm">
              G
            </div>
            <span className="text-sm font-bold tracking-tight text-stone-900 dark:text-stone-100">
              GatherWise AI
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400">
              — Intelligent Event Planning
            </span>
          </div>

          <p className="text-xs text-stone-500 dark:text-stone-400 text-center sm:text-right">
            Built for competitive hackathon evaluation. Inspired by engineering rigor, security, and deterministic guarantees.
          </p>
        </div>
      </div>
    </footer>
  );
}
