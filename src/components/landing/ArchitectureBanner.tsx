import Link from 'next/link';

export function ArchitectureBanner() {
  return (
    <section id="architecture" className="py-16 bg-stone-900 text-stone-100 transition-colors">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-stone-800/90 border border-stone-700 p-8 sm:p-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/30 mb-4">
              <span>Phase 3 Implemented · Live GenAI & Deterministic Engine</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-4">
              Production Architecture & Rigorous Engineering
            </h2>

            <p className="text-stone-300 text-base leading-relaxed mb-6">
              Planora AI avoids brittle, hallucinated end-to-end LLM prompts. Instead, it pairs a deterministic calculation engine (for hard budget ceilings and backwards milestone dates) with Google Gemini 2.5 Flash (for personalized theme concepts, vendor questions, and creative sparks).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-stone-700/80 pt-6 mb-8">
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                  GenAI Layer
                </span>
                <p className="text-sm font-medium text-white">
                  @google/genai SDK (gemini-2.5-flash)
                </p>
                <p className="text-xs text-stone-400">
                  Strict JSON schema validation & fallback protection
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                  Financial Math
                </span>
                <p className="text-sm font-medium text-white">
                  Deterministic Reconciler
                </p>
                <p className="text-xs text-stone-400">
                  100% budget conservation + contingency reserve
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                  Security Guardrail
                </span>
                <p className="text-sm font-medium text-white">
                  Server-Side Isolation
                </p>
                <p className="text-xs text-stone-400">
                  API keys never exposed to browser or client bundle
                </p>
              </div>
            </div>

            <Link
              href="/plan"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-amber-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition"
            >
              <span>Launch Event Planner</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
