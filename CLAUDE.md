# LayerProof Prototype — Claude Code Instructions

## Role in This Project
Working as a **product designer**: draft new UX flows and specs, implement those flows in the prototype, then define tracking events and success metrics for each flow.

## Dev Server
```
npm run dev        # Vite → http://localhost:5173/layerproof-prototype/
npm run build      # tsc -b && vite build (rebuilds committed dist/)
npm run lint       # ESLint
npm run preview    # Serve built dist/
```
`dist/` IS committed and deployed via GitHub Actions → GitHub Pages. Never add it to .gitignore. Always rebuild via `npm run build`, never edit dist/ manually.

## Import Alias
`@/` resolves to `src/`. Always use this — never use relative `../../` paths.

## Product Vocabulary (always use these names)
| Code Name | Product | Editor Type |
|---|---|---|
| Matte | Social Post | Canvas editor |
| Chromo | Presentation | Canvas editor |
| Vellum | Space / Image | Document editor |
| Kraft | Docs | Document editor |
| Mylar | Motion Editor | Timeline editor |
| App | App Builder | Component tree |

Routes use the code name slug: `/create/matte`, `/editor/matte`, etc.

## Docs Directory
All PRDs and UX specs live in `docs/`. Before implementing any flow or feature:
1. Check `docs/` for an existing PRD
2. If none exists, draft one there as a `.md` file following the PRD format below

### PRD File Format
```markdown
# PRD: [Feature Name]
**Version:** 1.0 | **Date:** YYYY-MM-DD

## Problem
One paragraph — what user problem does this solve?

## Goals
- Metric goal 1 (e.g., "Increase creation rate by X%")
- Metric goal 2

## User Flow
Step-by-step flow with route paths and UI states.

## Success Metrics
| Metric | Baseline | Target | Event |
|---|---|---|---|
| metric name | current | goal | event_name |

## Tracking Events
See Event Tracking section below for naming conventions.
```

Existing PRDs to reference:
- `docs/prd-homepage.md` — /home route, creation entry points, sidebar structure
- `docs/prd-onboarding-and-creation.md` — full onboarding (5 steps) + creation flow (3 stages) + editor types
- `docs/motion-editor-updates-prd.md` — Mylar motion editor UI updates (v2.0)
- `docs/motion-editor-ux-spec.md` — Mylar component-level UX spec with exact CSS values
- `docs/motion-editor-notion-board.md` — Mylar implementation board (all marked Done)

## Responsive Prototype Design

### Breakpoint system
Breakpoints are defined exclusively in `src/styles/responsive/breakpoints.css` as CSS media queries — **do not use Tailwind responsive prefixes** (`sm:`, `md:`, `lg:`). Responsive styling is achieved by overriding CSS custom properties at each breakpoint, not by writing per-breakpoint utility classes on elements.

| Breakpoint | Media query | `--gut` | `--sidebar-w` | Notes |
|---|---|---|---|---|
| Mobile | `max-width: 768px` | 16px | 215px | App not fully supported — mobile users hit a device gate at onboarding Step 3 |
| Tablet | `max-width: 1024px` | 20px | 215px | |
| Desktop (default) | 1024px – 1399px | 28px | 215px | Primary design target |
| Large desktop | `min-width: 1400px` | 36px | 235px | Scale up typography, sidebar, section padding |
| 4K / Ultra-wide | `min-width: 1800px` | 48px | 255px | Constrain content width with `max-width` + `margin: auto` |

### How to add responsive styles
1. Write the default style at the component level (in the feature CSS file or inline Tailwind)
2. Add breakpoint overrides to `src/styles/responsive/breakpoints.css` under the appropriate `@media` block
3. Prefer overriding CSS custom properties (`--gut`, `--sidebar-w`, font sizes) over duplicating layout rules
4. For wide-screen content containment, use the `max-width` + `margin: auto` pattern (see `.ov-banner`, `.type-page` in breakpoints.css)

### Testing responsive layouts
Use the `run` skill to start the dev server, then use the browser preview to resize the viewport:
- Desktop default: 1280px wide
- Large desktop: 1440px wide
- Tablet: 768px–1024px
- Mobile: 375px (note: app shows device gate, so test onboarding only)

### Mockups and flow drafts
Before implementing a responsive layout, create an HTML mockup using the `artifact-design` skill to validate the layout at multiple breakpoints. Use the existing CSS tokens (`--gut`, `--panel`, `--t1`, etc.) in the mockup so it matches the prototype's visual system.

### Mobile scope
The prototype is **desktop-first**. Mobile users are intercepted at onboarding Step 3 (device gate) and shown a "Finish on desktop" screen. Do not build full mobile layouts for authenticated pages — only ensure the device gate and landing page are usable on mobile.

## Event Tracking

### Tracking spec documents
When a new flow is designed, write a tracking spec as a Markdown file in `docs/tracking-<feature>.md`. This is a design artifact only — no analytics library is installed in the prototype. Do not connect to any analytics platform when writing tracking specs.

### Event naming convention
```
<noun>_<verb>
```
- Noun = the thing being acted on (lowercase, snake_case)
- Verb = what happened (past tense)

Examples:
```
onboarding_started          # user hits /onboarding
onboarding_step_completed   # user advances a step (properties: step_number, step_name)
onboarding_completed        # user finishes all 5 steps
product_selected            # user picks a product from the grid (properties: product_slug)
create_flow_started         # user lands on /create/:product (properties: product_slug)
prompt_submitted            # user hits Generate on the prompt screen (properties: product_slug, prompt_length)
agent_chat_completed        # user finishes the guided agent chat (properties: product_slug)
editor_opened               # user enters the editor (properties: product_slug, editor_type)
brand_kit_created           # user creates a new brand kit
theme_applied               # user applies a theme to content (properties: theme_id, product_slug)
```

### Event property conventions
- Always include `product_slug` when the event occurs inside a product flow
- Always include `step_number` and `step_name` for multi-step flows
- Use ISO 8601 for any timestamp properties
- Boolean properties: `is_*` prefix (e.g., `is_first_time`, `is_returning`)
- Counts: `*_count` suffix (e.g., `session_count`, `kit_count`)

### Tracking spec document format
When asked to produce a tracking spec for a flow, write it as a Markdown file in `docs/` named `tracking-<feature>.md` using this structure:
```markdown
# Tracking Spec: [Feature Name]
**Version:** 1.0 | **Date:** YYYY-MM-DD

## Events
| Event Name | Trigger | Properties |
|---|---|---|
| event_name | when it fires | prop1 (type), prop2 (type) |

## Funnels
List the ordered sequence of events that define the funnel.

## Metrics
| Metric | Formula | Target |
|---|---|---|
| Completion rate | completed / started | > X% |
```

### Success metrics categories
For each new flow, define metrics in these four categories:
1. **Activation** — did the user complete the flow? (funnel completion rate)
2. **Engagement** — how deeply did they interact? (steps completed, time in flow)
3. **Conversion** — did they reach the next milestone? (e.g., first project created)
4. **Retention** — did they come back? (D1/D7 return rate after flow completion)

## Routing
HashRouter (GitHub Pages compatible). Base: `/layerproof-prototype/`. Routes in `src/router.tsx`:
`/` LandingPage · `/home` HomePage · `/brand-kit` BrandKitPage · `/onboarding` OnboardingPage
`/create/:product` CreatePage · `/editor/:product` EditorPage · `/matte-v3` MatteV3Page
`/motion-editor` MotionEditorPage · `/all-projects` AllProjectsPage · `/trash` TrashPage · `/community` CommunityPage

## Directory Structure
```
src/
  features/        # Feature-first (brand-kit, create, onboarding, landing, motion-editor)
    create/
      components/
        matte-v3/  # Matte editor sub-components + editor UI primitives
          editor-ui.ts           # Barrel export for all four editor UI components
          EditorContextMenu.tsx  # Dropdown/context menus (wraps @radix-ui/react-dropdown-menu)
          EditorDialog.tsx       # Modal overlays (wraps @radix-ui/react-dialog)
          EditorTooltip.tsx      # Icon-button tooltips (wraps @radix-ui/react-tooltip)
          EditorTabs.tsx         # Tab groups (wraps @radix-ui/react-tabs)
    <feature>/components/ store/ hooks/ types/
  pages/           # Thin page-level wrappers (one per route)
  shared/
    components/ui/ # shadcn/ui primitives — add via: npx shadcn@latest add <name>
    context/       # ThemeContext (ThemeProvider, useTheme)
    icons/         # Custom SVG icons (index.tsx)
    lib/
      utils.ts     # cn(), deepClone(), normHex(), hexToRgb(), applyAccentVars()
    store/useUIStore.ts  # view, focusedId, modal state, tweaks (accent/density)
  data/            # Static seed data (brand-kits.ts, recent-projects.ts)
  styles/
    globals.css              # Master @import list — new CSS files must be added here
    tokens/variables.css     # CSS custom properties — single source of truth
    base/reset.css
    shared/                  # Reusable component CSS (buttons, cards, chips, etc.)
    layout/                  # app.css, sidebar.css, subsidebar.css
    features/                # Feature-scoped CSS per feature
    responsive/breakpoints.css  # Must always be the LAST @import in globals.css
```

## CSS / Styling — CRITICAL

### Dark/Light Mode
- Dark is DEFAULT (no class on `<html>`)
- Light mode adds `html.light` class — toggled by `ThemeContext`, persisted in localStorage
- **NEVER use Tailwind `dark:` prefix.** Write light-mode overrides as `html.light .selector { }` in CSS files.

### Design Token System (three layers must stay in sync)
1. CSS custom properties in `src/styles/tokens/variables.css` — source of truth
2. `tailwind.config.js` — maps utility classes to those vars
3. `@layer base` block in `variables.css` — bridges shadcn/Radix HSL tokens to product vars

Key tokens:
- Surfaces: `--app` `--panel` `--card` `--card-2` `--line` `--line-2`
- Text: `--t1` `--t2` `--t3`
- Accent (runtime-dynamic): `--accent` `--accent-soft` `--accent-line` `--accent-ink`
- Radii: `--radius` (14px) `--radius-sm` (10px) `--radius-lg` (20px)
- Layout: `--sidebar-w` (215px) `--gut` (28px default, 18px compact)

Tailwind equivalents: `bg-surface-app` `bg-surface-panel` `bg-surface-card` `text-t1` `text-t2` `text-t3` `text-accent` `border-line` `rounded-sm` `rounded-lg` `p-gut`

Accent color is runtime-dynamic: `applyAccentVars(hex)` sets CSS vars on `document.documentElement` directly. Use `var(--accent)` / `text-accent` — not hardcoded hex values.

### Adding CSS
- New feature CSS → `src/styles/features/<feature>/<name>.css`
- New shared CSS → `src/styles/shared/<name>.css`
- Manually add the `@import` to `src/styles/globals.css`
- `responsive/breakpoints.css` must stay as the last `@import`

## State Management (Zustand)
Three stores — do not add more without discussion:
- `useBrandStore` — brand kits, themes, CRUD (`src/features/brand-kit/store/`)
- `useUIStore` — view, focusedId, modal state, tweaks (`src/shared/store/`)
- `useOnboardingStore` — multi-step form state (`src/features/onboarding/store/`)

## Icons
- Phosphor: `import { IconName } from '@phosphor-icons/react'`
- Lucide: `import { IconName } from 'lucide-react'`
- Custom SVG: `import { MyIcon } from '@/shared/icons'`

## TypeScript
`noUnusedLocals` and `noUnusedParameters` are intentionally `false` (prototype). `erasableSyntaxOnly: true` — no legacy decorators or enum patterns.

## Matte Editor UI Components

Four purpose-built primitives live in `src/features/create/components/matte-v3/`. They wrap shadcn/Radix UI under the hood (accessibility, keyboard nav, focus management) and are styled with the `mv3-*` CSS tokens. **Always use these instead of raw HTML when working in the Matte editor.** If a pattern isn't covered, extend one of these or add a new component to the same folder — never reach for raw HTML.

Import everything from the barrel:
```tsx
import {
  EditorContextMenu, EditorContextMenuTrigger, EditorContextMenuContent,
  EditorContextMenuItem, EditorContextMenuSeparator, EditorContextMenuLabel,
  EditorContextMenuSub, EditorContextMenuSubTrigger, EditorContextMenuSubContent,
  EditorDialog, EditorDialogTrigger, EditorDialogContent, EditorDialogClose,
  EditorDialogHeader, EditorDialogTitle, EditorDialogBody, EditorDialogFooter,
  EditorTooltip, EditorTooltipProvider,
  EditorTabs, EditorTabsList, EditorTabsTrigger, EditorTabsContent, EditorTabGroup,
} from '@/features/create/components/matte-v3/editor-ui'
```

| Component | Use for | Key props |
|---|---|---|
| `EditorContextMenu` | Page thumbnail menu, attach menu, section menu, any right-click/overflow menu | `side`, `align` on Content; `danger`, `icon` on Item; `EditorContextMenuSub` for sub-menus |
| `EditorDialog` | Share overlay, version history, add page picker, outline panel, assets library | `size` (`sm`/`md`/`lg`/`xl`), `hideClose` |
| `EditorTooltip` | Any icon-only button that currently has a native `title` attribute | `label`, `side` (`top`/`right`/`bottom`/`left`), `delayDuration` |
| `EditorTabGroup` | Editor tab bar (`Image preview` / `Publishing`), share tabs, settings tabs | `tabs`, `value`, `onValueChange` |

CSS for all four lives at the bottom of `src/styles/features/create/editor.css` under the "Editor UI Components" section. Add new variants there — never inline styles on Radix primitives.

When adding a **new** editor UI pattern not covered above (e.g. a popover, a toast, a combobox):
1. Check `src/shared/components/ui/` for an existing shadcn primitive first.
2. If one exists, create a new `Editor<Name>.tsx` in `matte-v3/`, wrap it with `mv3-*` CSS classes, and export from `editor-ui.ts`.
3. Add its CSS to the "Editor UI Components" section of `editor.css`.
4. Never implement it with raw HTML + a manual backdrop/state pattern.

## What to Avoid
- Never use `dark:` Tailwind prefix — use `html.light` CSS overrides
- Never hardcode colors — use CSS custom property vars or Tailwind tokens
- Never create new Zustand stores without discussing
- Never use relative `../../` import paths — use `@/` alias
- Never edit `dist/` manually — always rebuild via `npm run build`
- Never use `mcp__Claude_Preview__*` tools
- Never connect to any analytics platform when working on this project — tracking specs are design documents only
- **Never implement context menus, dropdowns, modal overlays, tooltips, or tab groups with raw HTML in the Matte editor** — use the `editor-ui` components above or create a new one following the pattern

## Skills for Common Tasks
| Task | Skill |
|---|---|
| Draft a new UX flow or PRD | `product-management:write-spec` |
| Define success metrics for a feature | `product-management:metrics-review` |
| Brainstorm product ideas or approaches | `product-management:product-brainstorming` |
| Break a spec into implementation tasks | `anthropic-skills:spec-breakdown` |
| UI / styling / component work | `frontend-design` |
| **Responsive layout mockup (before implementation)** | **`artifact-design`** |
| **Responsive layout implementation and verification** | **`run`** |
| Launch dev server, verify any change | `run` |
| Code quality review | `engineering:code-review` |
| Simplification / cleanup pass | `simplify` |
| Visual mockups or standalone HTML prototypes | `artifact-design` |
| Charts / data visualization of metrics | `dataviz` |
| Reduce permission prompts | `fewer-permission-prompts` |
