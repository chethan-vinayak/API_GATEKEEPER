# Command Center Layout & Container Optimization

Optimize the main viewport and navigation container constraints to a well-proportioned 1280px (`max-w-7xl`) layout, eliminating uncomfortable widescreen stretching while maintaining crisp spatial rhythm and balanced density.

## User Review & Critical Decisions

> [!IMPORTANT]
> The user confirmed the following layout decisions during Phase 1 clarification:
> - **Container Width**: Standard 1280px container (`max-w-7xl`) with centered auto-margins and 24px horizontal padding.
> - **Grid Density & Proportions**: Balanced 4-column KPI card grid paired with a 2-column telemetry split for intercepted threat vectors and live event feeds.

---

## 1. Overview & Core Concept

- **Goal**: Replace overly wide screen stretch (`max-w-[1800px]`) with a disciplined 1280px container (`max-w-7xl`) that keeps KPI metrics, charts, and telemetry logs neatly aligned and easy to scan without eye fatigue.
- **Target Audience**: SecOps Incident Commanders, Security Auditors, and Red Team Testers.
- **Value**: Optimal visual hierarchy, reduced scanning distance on large monitors, and polished responsive layout.

---

## 2. User Experience & Visual Design

- **Layout Hierarchy**:
  - **Header & Navigation Bar**: Constrained to `max-w-7xl` with 3-zone contract (Logo Wordmark $\rightarrow$ Primary Tabs $\rightarrow$ Operator Controls).
  - **Main Viewport (`<main>`)**: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6`.
  - **KPI Grid**: Clean 4-column grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`) for primary security metrics.
  - **Telemetry Section**: 2-column split for intercepted threat categories and live event stream.
  - **Footer**: Matched to `max-w-7xl mx-auto` for exact vertical alignment across header, body, and footer.
- **Aesthetic Posture**: Dark mode slate (`bg-[#030712]`), hairline borders (`border-slate-800`), crimson accent accents (`text-red-400`, `bg-red-600`), and tabular typography (`font-mono tabular-nums`).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: 1280px (`max-w-7xl`) Container Constraint**
  - *Chosen Approach*: Replace `max-w-[1800px]` with `max-w-7xl` (1280px max width).
  - *Rationale*: Eliminates excessive horizontal dispersion on 2K/4K monitors and restores standard UI focus.
- **Decision 2: 4-Column KPI Metric Grid**
  - *Chosen Approach*: Group 7 KPI metrics into a primary 4-card row followed by 3 secondary detail cards.
  - *Rationale*: Ensures cards remain legible with generous padding without horizontal wrapping glitches.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           HEADER (max-w-7xl)                            │
│  [API GATEKEEPER Logo]   ───   [Nav Tabs]   ───   [Profile / Logout]    │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│                            MAIN (max-w-7xl)                             │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                     4-Column KPI Metric Row                       │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌─────────────────────────────────┐ ┌──────────────────────────────┐  │
│  │   Threat Vector Breakdown       │ │  Live Security Event Feed    │  │
│  │   (OWASP Anomaly Rules)         │ │  (Real-Time Incident Stream) │  │
│  └─────────────────────────────────┘ └──────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

- **Component Updates**:
  - `Header.tsx`: Update top container from `max-w-[1800px]` to `max-w-7xl mx-auto`.
  - `App.tsx`: Update `<main>` and `<footer>` containers from `max-w-[1800px]` to `max-w-7xl mx-auto`.
  - `DashboardKpi.tsx`: Refine grid break points (`lg:grid-cols-4`) for clean 4-column display.
