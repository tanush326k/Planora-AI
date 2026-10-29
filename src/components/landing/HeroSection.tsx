export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24 lg:py-28">
      {/* Subtle warm background glow */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 -translate-x-1/2 transform-gpu blur-3xl sm:-top-80"
      >
        <div 
          className="aspect-[1155/678] w-[68.125rem] bg-gradient-to-tr from-amber-200/40 via-amber-100/30 to-stone-200/20 opacity-70 dark:from-amber-950/20 dark:via-stone-900/40 dark:to-stone-950"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)'
          }}
        />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/80 bg-amber-50/90 px-3.5 py-1 text-xs font-medium text-amber-900 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300 mb-6">
            <span className="flex h-2 w-2 rounded-full bg-amber-500" />
            Designed for Weddings, Birthdays & Community Gatherings
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50 sm:text-5xl lg:text-6xl">
            Plan unforgettable celebrations{' '}
            <span className="block text-amber-700 dark:text-amber-500 mt-1">
              with calm clarity & precision.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl leading-relaxed text-stone-600 dark:text-stone-300">
            GatherWise AI harmonizes intelligent budget modeling, date-aware timelines, and priority vendor checklists. Say goodbye to scattered spreadsheets and last-minute panic.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/plan"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-8 py-4 text-base font-semibold text-white shadow-md shadow-amber-600/20 transition hover:bg-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 dark:bg-amber-600 dark:hover:bg-amber-500"
            >
              <span>Plan my event</span>
              <svg 
                className="h-5 w-5" 
                viewBox="0 0 20 20" 
                fill="currentColor" 
                aria-hidden="true"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" 
                  clipRule="evenodd" 
                />
              </svg>
            </a>

            <a
              href="#capabilities"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-stone-300 bg-white px-7 py-4 text-base font-semibold text-stone-800 shadow-sm transition hover:bg-stone-50 hover:border-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800"
            >
              Explore planning modules
            </a>
          </div>

          {/* Quick value trust badges */}
          <dl className="mt-14 grid grid-cols-3 gap-4 border-t border-stone-200/80 pt-8 dark:border-stone-800/80 text-left sm:text-center">
            <div>
              <dt className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                Event Types
              </dt>
              <dd className="mt-1 text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
                3 Dedicated Blueprints
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                Budget Logic
              </dt>
              <dd className="mt-1 text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
                Deterministic Math
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                GenAI Layer
              </dt>
              <dd className="mt-1 text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
                Google Gemini Ready
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
