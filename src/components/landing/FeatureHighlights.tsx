export function FeatureHighlights() {
  const features = [
    {
      title: 'Deterministic Budget Engine',
      description: 'Calculates exact dollar allocations, vendor percentage ceilings, and contingency buffers based on your actual budget — no AI hallucinated math.',
      icon: (
        <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: 'Date-Aware Milestone Timelines',
      description: 'Generates a phased countdown schedule calculated backwards from your event date so you always know what to tackle this week versus next month.',
      icon: (
        <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: 'Vendor Booking Checklists',
      description: 'Prioritized hiring windows, cost ranges, and must-ask vetting questions for caterers, photographers, venues, and sound technicians.',
      icon: (
        <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      )
    },
    {
      title: 'Google GenAI Creative Spark',
      description: 'Generates creative, personalized theme concepts, activities, and decor suggestions tailored to your guest count, vibe, and style.',
      icon: (
        <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    }
  ];

  return (
    <section id="capabilities" className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-500">
            Engineered For Reliability
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100 sm:text-4xl">
            Four Pillars of GatherWise AI
          </p>
          <p className="mt-3 text-base text-stone-600 dark:text-stone-300">
            A balanced architecture pairing deterministic mathematical guarantees with generative creative ideation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, idx) => (
            <div 
              key={idx}
              className="p-8 rounded-2xl border border-stone-200/80 bg-white/70 dark:bg-stone-900/60 dark:border-stone-800/80 shadow-sm transition hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-900/50 flex items-center justify-center mb-5">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2">
                {feature.title}
              </h3>
              <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
