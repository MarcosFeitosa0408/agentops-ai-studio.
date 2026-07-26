# AgentOps AI Studio

Enterprise AI Agent Platform for Data Analysis, Automation and Business Intelligence.

---

## Project Overview

AgentOps AI Studio is an enterprise-grade platform engineered to build, coordinate, and monitor autonomous AI agents. The platform empowers organizations to automate complex data analysis pipelines, execute cross-application workflows, and deliver real-time business intelligence with complete oversight and auditability.

## Vision

Our vision is to bridge the gap between advanced large language models (LLMs) and practical business operations. By providing an intuitive, secure, and robust orchestration workspace, AgentOps AI Studio enables business analysts and developers alike to build reliable multi-agent systems that solve actual business challenges without the common fragility of bespoke integration code.

## Planned Features

- **Agent Orchestration Workspace:** Visual interface to configure, parameterize, and manage multi-agent teams.
- **Data Analysis Engines:** Deep integration with SQL databases, CSV processing, and analytical tools for generating insights on demand.
- **Workflow Automation:** Action-execution pipelines with conditional logic and support for complex multi-step processes.
- **Business Intelligence Dashboards:** Comprehensive analytics to track agent usage, task execution logs, and ROI performance.
- **Enterprise Security & Guardrails:** Secure credential management, audit logging, role-based access control, and model-level guardrails.

## Technology Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, React Server Components)
- **Language:** [TypeScript](https://www.typescriptlang.org/) (Type-safe compilation)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Rapid UI utility styling)
- **Linting & Formatting:** [ESLint](https://eslint.org/) (Standard Flat Config) & [Prettier](https://prettier.io/)
- **Package Manager:** npm

## Project Structure

```text
├── .next/                  # Next.js build output
├── node_modules/           # Node dependencies
├── public/                 # Static assets
└── src/
    ├── app/                # Next.js App Router (pages, layout, routing)
    ├── components/         # Reusable UI & Layout Components
    │   ├── layout/         # Shell layout blocks (Topbar, Sidebar, etc.)
    │   └── ui/             # Reusable atomic UI elements (Buttons, Inputs, etc.)
    ├── context/            # React Context state providers (ThemeContext)
    ├── hooks/              # Custom React Hooks (useIsMounted)
    ├── lib/                # Modular utilities and third-party clients
    └── types/              # Global TypeScript interfaces and definitions
```

## Development Workflow

1. **Linting:** Ensure code standard compliance by running `npm run lint`.
2. **Formatting:** Automatically format the code using Prettier with `npx prettier --write .`.
3. **Building:** Validate TypeScript typing and Next.js compilation via `npm run build`.

## Installation

To get started, clone the repository and run the following commands:

```bash
# Install dependencies
npm install

# Start the local development server
npm run dev

# Format code
npx prettier --write .

# Build for production
npm run build
```

---

## Sprint 2 — Enterprise Design System

Our repository features a complete, highly-scalable **Enterprise Design System & UI Core** designed with premium SaaS aesthetics (inspired by Linear, Stripe, and OpenAI).

### Design Tokens

All visual constants are configured as semantic **Design Tokens** (using CSS Custom Properties in `src/app/globals.css` map to Tailwind `@theme` utilities). This guarantees absolute design consistency across light and dark modes without hardcoded colors.

- **Brand Colors:**
  - `Primary`: Indigo (`--primary`: `#4f46e5` Light / `#6366f1` Dark)
  - `Secondary`: Slate (`--secondary`: `#64748b` Light / `#94a3b8` Dark)
  - `Accent`: Teal (`--accent`: `#0d9488` Light / `#14b8a6` Dark)
  - `Success`: Emerald (`--success`: `#10b981` Light / `#34d399` Dark)
  - `Warning`: Amber (`--warning`: `#f59e0b` Light / `#fbbf24` Dark)
  - `Danger`: Rose/Red (`--danger`: `#ef4444` Light / `#f87171` Dark)
- **Surfaces & Layouts:**
  - `Background`: Very light grey `#f8fafc` Light / Dark deep grey `#030712` Dark.
  - `Surface / Card`: Pure White `#ffffff` Light / Steel grey `#1f2937` Dark.
  - `Border`: Slate borders (`--border`).
- **Typography:** Custom Google Font Geist integration configured for:
  - Display (large hero sizes)
  - Headings & Titles (firm bold sizes)
  - Subtitles, Body, Caption, Small Text, and Code.
- **Visual Parameters:** Standardized radii (`radius-sm` to `radius-full`), shadows (`shadow-sm` to `shadow-xl`), hover animations, focus rings, and z-indexes.

### Theme System

The design system incorporates a dual **Dark Theme & Light Theme** toggle utilizing a state-driven Context Provider (`src/context/ThemeContext.tsx`).

To eliminate hydration mismatches in Next.js Server Components, we leverage React 19's **`useSyncExternalStore`** hook inside our theme subscriber. This resolves hydration discrepancies by enforcing server-safe theme defaults during initial render, and synchronously applying user storage choices after client mounting—fully compliant with strict concurrent mode rules.

### Components

We implemented over **30+ Production-Ready Reusable UI Components** under `src/components/ui/` and `src/components/layout/`.

1. **Buttons & Badges:** `Button` (with prefix/suffix/loading states), `IconButton` (ARIA labeled), `Badge` (pill/sizes), `Avatar` (image/initial fallbacks), `Chip` (dismissible tags), and `Card` (interactive shadow options).
2. **Inputs & Controls:** `Input`, `PasswordInput` (toggle visibility), `Textarea`, `Checkbox`, `Radio`, `Switch` (sliding toggle), and custom `Select`.
3. **Overlays & Popups:** `DropdownMenu`, `Popover`, `Tooltip` (keyboard hover trigger), `Modal` (scroll locking & keyboard trap), and alert `Dialog`.
4. **Status & Loading:** `LoadingSpinner` (scalable), `ProgressBar` (interactive), `SkeletonLoader` (animation pulsing), `EmptyState` (with icon and custom buttons), `ErrorState` (retry action), and `Notification` (dismissible banners).
5. **Interactive Navigation:** `Tabs`, `Accordion` (collapsible list), `Breadcrumb`, and `Pagination` (dynamic ellipses).

### Layout & Responsive Grid

The layout features standard responsive containers (`Container`, `Section`) and shell components (`Navbar`, `Sidebar`, `Topbar`, `Footer`) built with responsive grids for Desktop, Tablet, and Mobile viewport compatibility.

---

## Roadmap

- **Sprint 1:** Project Initialization and Infrastructure Foundation. (Complete)
- **Sprint 2:** Design System Implementation and Atomic UI Core. (Current - Complete)
- **Sprint 3:** Visual Agent Designer & Workspace Editor. (Next)
- **Sprint 4:** Integration of Live LLM Providers and Data Connectors.

## Current Status

**Sprint 2 Design System Complete.** The visual foundation has been fully built, verified, documented, and tested with exactly **0 compilation errors and 0 linting warnings**.

## License

This project is licensed under the Proprietary License. All rights reserved.
