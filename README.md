# Planora AI — Every celebration, brilliantly planned.

> A GenAI-powered planning assistant for **Weddings**, **Birthdays**, and **Community Gatherings**, engineered with deterministic budget allocation, date-aware timelines, vendor checklists, and creative concept generation.

---

## 🌟 Overview & Architecture

Event planning is often fragmented across multiple spreadsheets, notes apps, and overwhelming vendor catalogs. **Planora AI** introduces calm and clarity by pairing:

1. **Deterministic Calculation Engine** (Mathematical Guarantees):
   - **Hard Budget Ceilings**: Strict dollar allocation math reconciling 100% to your total budget.
   - **Contingency Isolation**: Preserves a dedicated 5–10% contingency reserve buffer.
   - **Date-Aware Milestone Math**: Backwards-calculated countdown schedules from the event date.
   - **Zero Hallucination Arithmetic**: Financial totals are never delegated to LLM estimation.

2. **Google GenAI Creative Spark** (Powered by `@google/genai` & `gemini-3.8-flash`):
   - **Personalized Theme & Vibe Concepts**: Custom palettes, aesthetic guidance, and atmospheric vision.
   - **Curated Experience Ideas**: Tailored concepts across decor, entertainment, food/beverage, activities, and favors (with DIY badges).
   - **Vetting Questions**: Critical, high-leverage questions to ask before signing vendor contracts.
   - **Practical Recommendations**: Contextual logistics tailored to guest counts, seasons, and lead times.

---

## 🏗️ Project Structure

```text
d:\EVENT planner/
├── .agent/                             # Antigravity IDE design & engineering workflows (preserved)
├── public/                             # Vector icons and brand assets
├── src/
│   ├── app/                            # Next.js 16 App Router
│   │   ├── api/
│   │   │   ├── health/route.ts         # Server health & GenAI configuration status
│   │   │   └── plan/generate/route.ts  # POST endpoint for structured plan generation
│   │   ├── plan/page.tsx               # Interactive event planner & plan dashboard
│   │   ├── globals.css                 # OKLCH/warm-stone theme variables & Tailwind
│   │   ├── layout.tsx                  # Semantic root layout with Navbar & Footer
│   │   └── page.tsx                    # Landing page with interactive category explorer
│   ├── components/                     # Reusable UI component modules
│   │   ├── landing/                    # Hero, EventCategories, FeatureHighlights, Architecture
│   │   ├── layout/                     # Navbar, Footer
│   │   └── planner/                    # PlannerForm, PlanView (tabs: Concept, Budget, Timeline, Vendors, Ideas)
│   ├── lib/
│   │   ├── gemini/
│   │   │   ├── client.ts               # Server-side Gemini client wrapper & config guards
│   │   │   └── promptTemplates.ts      # Structured prompt templates
│   │   ├── planning/
│   │   │   ├── budgetCalculator.ts     # Deterministic budget math & contingency calculations
│   │   │   ├── dateUtils.ts            # Date-aware timeline milestone math
│   │   │   ├── deterministicPlanner.ts # Complete baseline planning engine & safe fallback
│   │   │   └── eventCategories.ts      # Domain blueprints for Wedding, Birthday & Community
│   │   └── validation/
│   │       └── planSchema.ts           # Zod server & client input validation schemas
│   ├── types/                          # Domain contracts & TypeScript interfaces
│   │   ├── event.ts                    # Event types, details & category models
│   │   ├── budget.ts                   # Budget categories, items & allocations
│   │   ├── timeline.ts                 # Milestones, phases & priorities
│   │   ├── vendor.ts                   # Vendor checklist, booking windows & vetting
│   │   ├── genai.ts                    # LLM request/response contracts
│   │   └── index.ts                    # Central barrel export
│   └── __tests__/                      # Automated unit test suite
│       ├── gemini/                     # Configuration detection & error isolation tests
│       ├── planning/                   # Budget limits, date edge cases & planner tests
│       └── validation/                 # Zod schema constraint tests
├── .env.example                        # Safe environment template (placeholders only)
├── .gitignore                          # Ignores .env*, node_modules, .next; tracks .env.example
├── .npmrc                              # pnpm workspace configuration
├── README.md                           # Documentation with setup, commands & roadmap
├── package.json                        # Scripts & dependencies
└── tsconfig.json                       # TypeScript configuration (@/* -> ./src/*)
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v20+ (tested on Node v26.7.0)
- **Package Manager**: `pnpm` v11+ (or `npm`)

### Installation

1. Open project directory:
   ```bash
   cd "d:\EVENT planner"
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Add your Google Gemini API key to `.env.local`:
   ```env
   GEMINI_API_KEY=your_actual_api_key_from_google_ai_studio
   # Optional model override (defaults to gemini-3.8-flash):
   GEMINI_MODEL=gemini-3.8-flash
   ```

### Development & Build Commands

- **Run Development Server**:
  ```bash
  pnpm dev
  ```
  Open [http://localhost:3000](http://localhost:3000) (or navigate directly to [http://localhost:3000/plan](http://localhost:3000/plan)).

- **Run All Unit Tests**:
  ```bash
  pnpm test
  ```

- **Run TypeScript Checks**:
  ```bash
  pnpm type-check
  ```

- **Run ESLint**:
  ```bash
  pnpm lint
  ```

- **Run Production Build**:
  ```bash
  pnpm build
  ```

- **Start Production Server**:
  ```bash
  pnpm start
  ```

---

## 🧪 Testing the Real Gemini Integration

1. Add a valid Gemini API key to `.env.local`:
   ```env
   GEMINI_API_KEY=AIzaSy...
   ```
2. Check the health endpoint:
   ```bash
   curl http://localhost:3000/api/health
   ```
   Verify that `"geminiConfigured": true` and `"model": "gemini-3.8-flash"`.
3. Submit an event plan in the UI at `/plan` or via curl:
   ```bash
   curl -X POST http://localhost:3000/api/plan/generate \
     -H "Content-Type: application/json" \
     -d '{"title":"Golden Sunset Wedding","type":"wedding","date":"2027-06-20","guestCount":100,"totalBudget":25000}'
   ```
4. Verify response header `X-Plan-Source: gemini` and status `200`.

---

## 🔒 Security & Data Safety

- **Server-Side Credentials**: `GEMINI_API_KEY` is loaded strictly on the server in API routes. It is never prefixed with `NEXT_PUBLIC_` and never bundled into client JavaScript.
- **Input Sanitization**: User inputs are strictly validated with Zod prior to processing.
- **Structured Schema Safety**: Gemini structured outputs (`responseSchema`) prevent prompt injections and guarantee type compliance.
- **Error Redaction**: All API errors sanitize potential credential strings before logging or emitting responses.
