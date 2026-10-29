# GatherWise AI — Intelligent Event Planning Assistant

> A GenAI-powered planning assistant for **Weddings**, **Birthdays**, and **Community Gatherings**, engineered with deterministic budget allocation, date-aware timelines, vendor checklists, and creative concept generation.

---

## 🌟 Overview & Value Proposition

Event planning is often fragmented across multiple spreadsheets, notes apps, and overwhelming vendor catalogs. **GatherWise AI** introduces calm and clarity by uniting:

1. **Domain-Specific Blueprints**: Purpose-built planning models for Weddings, Milestone Birthdays, and Community/Charity events.
2. **Deterministic Budget Engine**: Mathematically sound cost breakdowns, vendor allocation ceilings, and contingency buffers.
3. **Date-Aware Milestone Timelines**: Phased countdown schedules calculated backward from the event date.
4. **Actionable Vendor Checklists**: Booking windows, estimated cost brackets, and vetting questions.
5. **Google GenAI Creative Spark**: Contextual theme ideation, DIY concepts, and conversational plan refinement powered by Google Gemini.

---

## 🏗️ Architecture & Directory Structure

```text
d:\EVENT planner/
├── .agent/                    # Antigravity IDE design & engineering workflows (preserved)
├── public/                    # Static assets & icons
├── src/
│   ├── app/                   # Next.js 16 App Router
│   │   ├── api/
│   │   │   └── health/        # System & GenAI configuration health check
│   │   ├── globals.css        # Tailwind CSS theme & typography tokens
│   │   ├── layout.tsx         # Root layout with responsive navigation & footer
│   │   └── page.tsx           # Polished landing page with interactive category explorer
│   ├── components/            # Reusable UI component modules
│   │   ├── landing/           # Hero, EventCategories, FeatureHighlights, Architecture
│   │   └── layout/            # Navbar, Footer
│   ├── lib/
│   │   ├── gemini/            # Google GenAI server client & prompt templates
│   │   └── planning/          # Deterministic budget calculators & date utilities
│   ├── types/                 # Typed contracts for events, budgets, timelines & GenAI
│   └── __tests__/             # Unit tests for planning algorithms
├── .env.example               # Environment variables template
├── eslint.config.mjs          # Linting rules
├── next.config.ts             # Next.js configuration
├── package.json               # Package manifest & scripts
└── tsconfig.json              # TypeScript strict configuration
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v20+ (tested on Node v26.7.0)
- **Package Manager**: `pnpm` v11+ (or `npm`)

### Installation

1. Clone or open the project directory:
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
   Edit `.env.local` and provide your Google Gemini API key:
   ```env
   GEMINI_API_KEY=your_actual_api_key_from_google_ai_studio
   ```

### Development & Build Commands

- **Start Development Server**:
  ```bash
  pnpm dev
  ```
  Open [http://localhost:3000](http://localhost:3000) in your browser.

- **Check API Health**:
  ```bash
  curl http://localhost:3000/api/health
  ```

- **Run Linting**:
  ```bash
  pnpm lint
  ```

- **Run TypeScript Checks**:
  ```bash
  pnpm type-check
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

## 🔒 Security & Data Safety

- **Server-Side Credentials**: `GEMINI_API_KEY` is accessed strictly in server components or API routes. It is never prefixed with `NEXT_PUBLIC_` and never bundled into client-side JavaScript.
- **Input Sanitization**: User inputs will be validated before prompt composition.
- **Safe Rendering**: All generative output will be rendered via structured JSON schemas rather than raw unescaped HTML strings.

---

## 🗺️ Roadmap & Phase Execution

| Phase | Milestone | Status |
|---|---|---|
| **Phase 1** | Read-Only Hackathon Audit | ✅ Complete |
| **Phase 2** | Bootstrap Application Foundation & Landing Page | ✅ Complete |
| **Phase 3** | Google Gemini API Server Integration & Structured Output | ⏳ Next |
| **Phase 4** | Interactive Event Creation Wizard & Plan Renderer | 📋 Planned |
| **Phase 5** | Conversational Plan Refinement & Chat Assistant | 📋 Planned |
| **Phase 6** | Polish, Accessibility Audit, Automated Tests & Deployment | 📋 Planned |

---

## ⚖️ Hackathon Evaluation Alignment

- **Problem Statement Alignment (HIGH)**: Covers Weddings, Birthdays, and Community events with tailored budgets, timelines, and vendors.
- **Code Quality (HIGH)**: Clean Next.js 16 App Router structure, TypeScript strict mode, reusable component hierarchy.
- **Security (MEDIUM)**: Complete isolation of LLM credentials on the server side.
- **Efficiency (MEDIUM)**: Fast deterministic calculations for math; targeted single-pass structured JSON for GenAI.
- **Testing (LOW)**: Modular math and utility testing structure ready for CI.
- **Accessibility (LOW)**: Semantic HTML, keyboard-navigable tabs, ARIA landmarks, WCAG-compliant color contrast.
