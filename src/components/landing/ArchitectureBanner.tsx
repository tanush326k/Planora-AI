export function ArchitectureBanner() {
  return (
    <section id="architecture" className="py-16 bg-stone-900 text-stone-100 transition-colors">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-stone-800/90 border border-stone-700 p-8 sm:p-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300 border border-amber-500/30 mb-4">
              <span>Phase 2 Foundation Verification</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-4">
              Production Architecture & Hackathon Roadmap
            </h2>

            <p className="text-stone-300 text-base leading-relaxed mb-6">
              GatherWise AI avoids brittle, hallucinated end-to-end LLM prompts. Instead, it pairs a deterministic calculation engine (for budgets and timeline dates) with Google Gemini (for creative ideation, contextual advice, and dynamic plan refinement).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-stone-700/80 pt-6">
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                  Current Status
                </span>
                <p className="text-sm font-medium text-white">
                  ✓ Phase 2 Complete (App & Domain Foundation)
                </p>
                <p className="text-xs text-stone-400">
                  Next.js 16, TypeScript, Tailwind CSS, App Router
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                  Next Phase
                </span>
                <p className="text-sm font-medium text-white">
                  Phase 3: Google Gemini API Integration
                </p>
                <p className="text-xs text-stone-400">
                  Official SDK, structured JSON output validation
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
                  API keys never exposed to client or browser bundle
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
