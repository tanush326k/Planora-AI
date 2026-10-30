# Planora AI — Application Screenshots Directory

This directory stores authentic high-resolution screenshots of the live Planora AI application deployed at [https://planora-ai-beige.vercel.app](https://planora-ai-beige.vercel.app). These screenshots are referenced throughout the project root [`README.md`](../../README.md) to showcase core user journeys, planning capabilities, and user interfaces.

---

## 📸 Captured Screenshots Inventory

| File Name | Viewport / Section | Description | Live Route / State |
|---|---|---|---|
| `home-page.png` | Desktop (1440×960) | Full landing page hero, category overview, and architecture banner | `/` |
| `planner-page.png` | Desktop (1440×960) | Interactive event planning form with dynamic category presets & vibe tags | `/plan` (initial state) |
| `event-plan.png` | Desktop (1440×960) | Generated plan overview with executive summary, model badge, and color palette | `/plan` (Concept tab) |
| `budget-dashboard.png` | Desktop (1440×960) | Deterministic budget breakdown, category distributions & contingency reserve | `/plan` (Budget Allocation tab) |
| `timeline.png` | Desktop (1440×960) | Date-aware milestone timeline, phase progression & countdown math | `/plan` (Milestone Timeline tab) |
| `vendor-checklist.png` | Desktop (1440×960) | Vendor requirements, booking windows & contract vetting questions | `/plan` (Vendor Checklist tab) |
| `personalized-ideas.png` | Desktop (1440×960) | Curated creative concepts, cost tags & DIY feasibility badges | `/plan` (Creative Spark Ideas tab) |
| `ai-assistant.png` | Desktop (1440×960) | Conversational plan refinement interface & live regeneration bar | `/plan` (Refinement bar) |

---

## 📐 Recommended Asset Specifications

- **Format**: PNG (`image/png`)
- **Resolution / Dimensions**: Minimum 1440px width (e.g., 1440×900 or 1440×960) with standard 1x or 2x HiDPI DPR.
- **Aspect Ratio**: 16:10 or 16:9 for consistent GitHub markdown layout rendering.
- **Color Space**: sRGB.
- **Compression**: Clean lossless PNG compression.

---

## 🛠️ How to Recapture or Update Screenshots

Screenshots can be automatically re-captured at any time from the live Vercel deployment using Chrome DevTools Protocol (CDP) or manual capture:

### Automated Capture (Headless Chrome CDP)
Run the automated capture script located in scratch or execute with Node.js against the running live site:
```bash
# Ensure Chrome is installed at standard path, then execute CDP capture script
node scratch/capture_screenshots.mjs
```

### Manual Capture Instructions
1. Open [https://planora-ai-beige.vercel.app](https://planora-ai-beige.vercel.app) in Google Chrome or Edge.
2. Set browser viewport to 1440×900 (F12 > Device Toolbar > Responsive > 1440×900).
3. Capture the landing page (`home-page.png`).
4. Navigate to `/plan` and capture the clean form (`planner-page.png`).
5. Fill the form with representative event data (e.g., Wedding, 120 guests, $35,000 budget, Monterey CA).
6. Click **Generate Complete Plan** and wait for Gemini / Deterministic engine response.
7. Click each tab and capture the respective view (`budget-dashboard.png`, `timeline.png`, `vendor-checklist.png`, `personalized-ideas.png`).
8. Scroll to the bottom refinement section to capture `ai-assistant.png`.
9. Save with the exact filenames listed in the inventory table above.

---

## 🔗 GitHub Relative Image Path Convention

In GitHub Markdown, images stored in this folder are referenced from the repository root `README.md` using clean relative URLs:

```markdown
![Planora AI Budget Dashboard](docs/screenshots/budget-dashboard.png)
```

GitHub automatically resolves and renders these relative paths on both web and mobile repository views.
