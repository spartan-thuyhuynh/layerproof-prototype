# PRD: Onboarding & Creation Flow

**Document type:** Product Requirements Document
**Audience:** Design & Development team
**Status:** Draft — v3.0
**Date:** 2026-06-18

---

## Overview

This document covers the end-to-end flow from a new user signing in for the first time to completing their first project in the editor. It is structured in three phases:

1. **Onboarding** — 3 steps that orient the user and route them to the right product, with a device gate that blocks mobile users before they reach the creation experience
2. **Creation Flow** — the AI-assisted prompt → brief → outline experience before the editor opens
3. **Editor** — the workspace where content is built, split into three layouts depending on the product type

This is the critical path for new user activation. Every decision in this document is oriented around getting the user to their first generated output as fast as possible.

---

## Background & Motivation

LayerProof is a multi-product AI content platform. New users arrive with different intent levels — some know exactly what they want to make, others are exploratory. The flows described here solve three problems:

1. **Routing** — getting each user to the right product without overwhelming them with options upfront
2. **Device mismatch** — the creation experience is built for desktop; mobile users need to be redirected early before they invest time in a flow they cannot complete
3. **Blank-slate anxiety** — the AI-assisted creation flow removes the burden of starting from nothing; the user describes what they want and the system structures it before they ever touch the editor

---

## Product Goals

1. **Time to first output** — a new user should reach a generated piece of content within their first session
2. **Reduce decision fatigue at sign-up** — the onboarding asks as little as possible before getting the user into a product
3. **Catch mobile users early** — redirect mobile users at Step 3 before they reach the creation flow, not after
4. **Make AI assistance feel guided, not robotic** — the creation flow should feel like talking to a knowledgeable collaborator, not filling out a form
5. **Editor clarity** — each product type has a distinct, purposeful editor layout that matches the output being created

---

## Users & Jobs-to-be-Done

| User type | Job-to-be-done |
| --- | --- |
| First-time creator | Get something made quickly without setup friction |
| Marketer / content lead | Generate on-brand social posts or docs in minutes |
| Founder / solo operator | Build a pitch deck or landing page without a designer |
| Agency producer | Spin up a project for a client brief quickly |
| Mobile visitor | Understand quickly why they need to switch to desktop |

---

# Phase 1 — Onboarding

**Route:** `/onboarding`
**Steps:** 3 (desktop) · 2 + gate (mobile)
**Goal:** Get the user signed in, device-validated, and routed to a product with minimal friction

---

## Step 1 — Sign Up

**Layout:** Full-page split — image hero on the left, auth form on the right. This is the only step with a distinct full-page layout. No progress bar or back button is shown.

**Auth options**

- Sign in with Google — one click, skips all form fields
- Email + password — email must contain `@`, password must be ≥ 6 characters
- Remember me toggle
- Forgot password link
- "Don't have an account? Sign up" link

**Validation:** Continue is disabled until both fields pass validation. Google bypasses this entirely.

**Copy:** *"Get started in seconds"*

---

## Step 2 — About You

**Purpose:** Lightweight personalisation. Both sub-steps are fully skippable.

The options presented in each grid are not static — they are optimized based on user data. The order and selection of choices may be updated over time to reflect the most common responses, surface emerging segments, or support A/B testing.

**Sub-step 1 of 2 — Role**

A grid of 6 options: Designer · Marketer · Content Creator · Developer · Founder / Business Owner · Other

Selecting "Other" reveals a mandatory free-text field inline. The user must fill it in before Continue is enabled — the input is the answer for this sub-step, not a supplement to a chip selection. Skip bypasses the sub-step entirely and jumps to sub-step 2.

**Sub-step 2 of 2 — How did you hear about us**

A grid of 6 options: Social Media · Friend or Colleague · Search Engine · Blog or Article · Product Hunt · Other

Same behaviour: selecting "Other" reveals a mandatory free-text field that must be filled before Continue is enabled. Skip bypasses the sub-step and advances to Step 3.

> ℹ️ This step does not block progression. It is informational only and has no effect on the creation flow.

---

## Step 3 — Device Check (Mobile) · Choose Product (Desktop)

Step 3 forks based on the user's device. The device check happens at this point — after sign-up and personalisation are complete, but before any product selection or creation flow entry.

---

### 3A — Device Gate (mobile users only)

**Trigger:** Detected on a mobile or small-screen device.

**Purpose:** LayerProof's creation experience — the canvas editor, outline editor, and agent chat — is built for desktop. Rather than letting a mobile user proceed into a flow they cannot complete, the gate intercepts them at Step 3 and redirects them to continue on desktop.

**Layout:** Centered single-column screen. No progress bar action is available — this is a terminal state for the mobile session.

**Elements**

- **Icon** — a mobile phone outline (40×40, stroke style)
- **Heading** — *"Finish setup on desktop"*
- **Body copy** — *"LayerProof is built for desktop — the full creative experience needs a bigger screen. Copy the link below and open it on your computer to continue."*
- **URL box** — displays `layerproof.com/onboarding` with a **Copy link** button. Clicking copies the current page URL to clipboard via the browser's clipboard API.
- **Footer hint** — *"Already have an account? Log in on your desktop to pick up right where you left off."*

**Behaviour:** The flow stops here for mobile users. There is no Continue button and no way to proceed to Step 3B or the creation flow from this state. The user must switch to a desktop device.

> ⚠️ The device check must be evaluated before rendering Step 3B. If a user resizes a browser window or rotates a tablet, the gate should re-evaluate and dismiss if the breakpoint clears.

---

### 3B — Choose Product (desktop users only)

**Purpose:** Route the user to a product. This is the last onboarding step — selecting a product immediately navigates to `/create/:slug` and starts the creation flow.

**Product grid**

| Product | Name | Type | Status |
| --- | --- | --- | --- |
| social-post | LayerProof Matte | Social Post Generator | Active |
| presentation | LayerProof Chromo | Slide Generation | Active |
| space | LayerProof Vellum | Image Generator | Active |
| docs | LayerProof Kraft | Long Form Content | Active |
| design | LayerProof Design | Graphic Design | Coming Soon |
| app | LayerProof App | App Builder | Coming Soon |

Each card shows a product thumbnail, name, category label, and one-line description. Coming Soon cards are rendered but non-interactive.

**Nudge:** After 7 seconds of inactivity, a tooltip bubble appears above the Matte card — *"Not sure? Start here!"* — to reduce decision paralysis for undecided users.

**On click:** Navigates to `/create/:slug`. Onboarding ends. The creation flow begins.

---

# Phase 2 — Creation Flow

**Route:** `/create/:slug`
**Entry points:** Step 3B of onboarding · Homepage product cards · Homepage sub-product pills
**Goal:** Guide the user from a blank prompt to a structured brief before the editor opens

The creation flow has three stages: **Prompt Screen → Agent Chat → Outline Editor**

---

## Stage 1 — Prompt Screen

**Layout:** Full-screen immersive view with a dark radial gradient background. Each product has a unique gradient.

### Elements

**Product chip**
Small pill showing the product icon and label, styled in the product's accent color.

**Headline**
Product-specific. One keyword is wrapped in `{}` and renders highlighted in pink.
Example: *"What {post} will your audience love?"* → "post" is pink.

**Sub-headline**
One sentence describing what this product creates.

**Prompt textarea**
- Auto-focused on mount
- Product-specific placeholder text
- Cmd/Ctrl + Enter submits
- Inline action buttons: web search, attach file (UI present; non-functional in prototype)

**Generate button**
- Disabled when textarea is empty
- Activates with the product's accent color when text is present
- Clicking advances to Agent Chat

**Suggestion chips**
- 3 visible at a time, drawn from a pool of 6 per product
- Clicking a chip fills the textarea
- Shuffle button cycles through the pool in groups of 3

**Back button**
Returns to `/onboarding` with `resumeFromCreate: true` — restores the user's position in the wizard without resetting state.

### Product-specific copy

| Product | Headline | Placeholder |
| --- | --- | --- |
| Social Post | What {post} will your audience love? | e.g. Summer sale campaign for a coffee brand, warm and inviting tone… |
| Docs | What idea should be {written} down? | e.g. Q3 product roadmap for a SaaS startup, executive summary style… |
| Space | What image will you {generate} today? | e.g. Brand asset hub for a design team, organized by campaign… |
| Presentation | What idea will you {present} next? | e.g. Investor pitch deck for a Series A startup, 10 slides, modern style… |
| Design | What brand will you {design} today? | e.g. Banner ads for a product launch, 3 sizes, minimalist look… |
| App | What experience will you {build} next? | e.g. Landing page for a SaaS product, conversion-focused with demo CTA… |

---

## Stage 2 — Agent Chat

**Layout:** Dark chat interface with a persistent input bar at the bottom and a header at the top.

**Purpose:** Collect structured requirements from the user — platform, audience, tone, theme — then produce a brief for the user to approve before generation begins.

### Phase sequence

| Phase | What the user sees |
| --- | --- |
| idle | Empty thread |
| tool-form | User prompt bubble + `read_campaign_state` tool call (running) |
| form | Tool call resolves → CampaignDetailsCard form appears |
| submitting | Form submitted → typing indicator |
| tool-brief | `prepare_guided_generation_context` tool call (running) |
| brief | Both tool calls resolved → BriefCard appears |
| outline | Full-screen Outline Editor replaces the chat |

---

### CampaignDetailsCard

A structured form that appears in the chat thread. Fields are drawn from each product's configuration.

**Platform** — chip group (e.g. Instagram · LinkedIn · X · All Platforms)

**Target audience** — free-text input (e.g. *"CS students, software engineers…"*)

**Tone** — chip group (e.g. Professional · Casual & Friendly · Bold & Direct · Playful)

**Posts / count** — chip group (e.g. 1 variation · 3 variations · 5 variations)

**Theme** — button that opens the Theme Library Modal

The **Confirm requirements** button is disabled until Platform, Tone, and Theme are all selected.

---

### Theme Library Modal

Opens from the Theme field. Two tabs:

**System themes** — 9 curated presets:
Minimal Dark · Bold Gradient · Clean Light · Neon Accent · Warm Terra · Ocean · Rose Gold · Forest · Slate

**Your themes** — two sections:
- Standalone themes (3 in prototype)
- Brand kit themes — 3 auto-generated variants per brand kit: Primary, Dark, Minimal

Each card shows a micro color-palette preview (background, text, accent). Selecting a theme closes the modal and populates the field.

---

### BriefCard

Generated after the form is submitted. Appears in the chat thread.

**Contains:**
- Campaign title — product label + user prompt
- Metadata table: Platform · Audience · Theme · Tone · Format
- 5 proposed post themes / topic ideas
- **Generate outline** button → advances to Outline Editor
- **What would you like to change?** free-text input + send (UI present; non-functional in prototype)

> 💡 The brief gives the user a checkpoint to verify the AI's interpretation of their prompt before committing to generation.

---

## Stage 3 — Outline Editor

**Layout:** Two-column split view — left sidebar (guided chat), right panel (content outline). Full-screen; replaces the Agent Chat.

---

### Left sidebar — Guided chat

| Element | Description |
| --- | --- |
| User prompt bubble | The original prompt the user typed |
| Context chips | Tone and Format values from the form |
| `list_entries` tool call | Running / done indicator; expandable to reveal JSON preview of the outline |
| Update messages | Confirms Tone, Theme, and Aspect Ratio have been applied |
| Agent confirmation bubble | *"Your outline looks great! Ready to generate?"* |
| Adjust button | Focuses the input and shows refinement suggestion chips |
| Confirm & Generate button | Navigates to the editor |
| Adjust suggestion chips | Change tone to more casual · Reduce to 3 posts · Focus on product benefits · Add a strong CTA |
| Chat input | Free-form refinement with Add (+) and Send actions |

---

### Right panel — Content outline

**Toolbar** — three chips showing current values:

| Chip | Example value |
| --- | --- |
| Text Format | Auto · Concise · Professional |
| Theme | Minimal Dark |
| Aspect Ratio | 1:1 Square |

**Post cards** — one per generated topic (5 by default). Each card contains:

| Field | Notes |
| --- | --- |
| Title | Editable inline |
| Subtitle | Editable, optional |
| Image Description | Editable; muted style — describes the visual for AI image generation |
| CTA | Editable, optional |

Post count badge shows total posts in the product's accent color.

**Bottom bar** — AI Model selector (UI present; non-functional in prototype)

**Confirm & Generate** → navigates to `/editor/:slug`

---

# Phase 3 — Editor

**Route:** `/editor/:slug`

All three editor types share a **common top bar:**

| Element | Description |
| --- | --- |
| Back (←) | Returns to `/home` |
| Product chip | Icon + label in the product's accent color |
| Project title | "Untitled [Product]" |
| Share button | Non-functional in prototype |
| Publish button | Styled with product accent color; non-functional in prototype |

---

## Editor Type A — Canvas Editor

**Products:** Social Post (Matte) · Presentation (Chromo) · Design

**Layout:** Three columns — left toolbox · center canvas · right properties panel

### Left — Toolbox

| Tool | Icon | Notes |
| --- | --- | --- |
| Select | ↖ | Active by default; highlighted in product color |
| Text | T | |
| Shape | □ | |
| Image | ⬜ | |
| AI | ✦ | |

Below a separator: Brand Kit button (layers icon) · Components button (grid icon)

### Center — Canvas

**Canvas toolbar:** Page 1 · + Add page · Zoom 50% · Fit

**Canvas frame** — white workspace with rendered content preview:

- **Social Post:** Image placeholder → headline + body text lines → "Shop Now" CTA button
- **Presentation:** Colored headline block → 3-column content boxes
- **Design:** Abstract layered shapes in product color

### Right — Properties panel

| Section | Properties |
| --- | --- |
| Format | 1080 × 1080 px · RGB Color · 72 DPI |
| Fill | Background color · Gradient · Image fill |
| Typography | Font family · Size / Weight · Line height |
| Effects | Shadow · Blur · Opacity |

---

## Editor Type B — Document Editor

**Products:** Docs (Kraft) · Space (Vellum)

**Layout:** Two columns — left outline/folder panel · center document body

### Left — Outline / Folders

**Docs:** Section list — Introduction · Overview · Key Findings · Recommendations · Appendix. First item active in product color. "+ Add section" at bottom.

**Space:** Folder tree — 📁 Brand Assets · 📁 Campaigns · 📁 Templates · 📁 Archive. "+ New folder" at bottom.

### Center — Document body

**Docs:** Long-form content view with title skeleton, section headings, and body copy lines at varying widths.

**Space:** Asset grid — 6 cards in 3 columns. Each card has a thumbnail (product-color tinted), image icon, title and subtitle skeletons.

---

## Editor Type C — App Builder

**Products:** App

**Layout:** Three columns — left component tree · center preview canvas · right inspector

### Left — Component tree

Header · Hero section · Feature cards · Testimonials · CTA Banner · Footer

First item active in product color. "+ Add component" at bottom.

### Center — Preview canvas

**Canvas toolbar:** Preview · Mobile · Zoom 75%

**App preview frame:**
- Nav bar with logo skeleton + 3 nav links
- Hero: headline, sub-headline, "Get Started" CTA in product color
- Feature cards row: 3 cards with heading and 2 body lines each

### Right — Inspector

| Section | Fields |
| --- | --- |
| Layout | Width · Height · Padding · Gap |
| Content | Heading text · Body copy · CTA label · CTA link |
| Style | Background · Text color · Border radius |

---

# Key Design Decisions

## Why intercept mobile users at Step 3, not earlier?

Steps 1 (Sign Up) and 2 (About You) are functional on any screen size — they are simple forms and chip grids. The device gate is placed at Step 3 because that is the first point where a mobile user would hit a wall: the product grid, creation flow, and editor are all desktop-only experiences. Intercepting earlier would frustrate users who could still complete the auth and personalisation steps on mobile. Intercepting later wastes the user's time. Step 3 is the right threshold.

Critically, the gate happens *after* sign-up is complete — the user's account already exists when they see the gate. The desktop continuation URL at `layerproof.com/onboarding` will resume their session and pick up at Step 3B automatically.

## Why does onboarding end at product selection?

Traditional SaaS onboarding collects setup information before letting users do anything. LayerProof inverts this — the only gates before creation are authentication, personalisation, and device validation. Brand setup is handled separately in the Brand Kit section. This reduces time from sign-up to first output and avoids overwhelming new users with configuration before they've seen value.

## Why use a chat interface instead of a form?

A sequential form feels like admin work. Presenting the same questions inside a chat thread — with tool call indicators, typing states, and agent bubbles — frames the experience as a collaboration. The underlying data collected is identical, but the medium communicates that the user has an AI working *with* them.

## Why show a brief before generating?

1. **Trust** — showing the AI's interpretation of the prompt before acting gives the user a chance to correct misunderstandings before any expensive generation happens
2. **Efficiency** — catching a wrong tone or audience at the brief stage is far cheaper than regenerating full content

## Why have an Outline Editor between the brief and the editor?

The Outline Editor is a structured preview of what will be generated — titles, subtitles, image descriptions, and CTAs for each post. Users can edit structure before any rendering happens. It also creates anticipation — the user sees the shape of their content before the editor opens, making the final generation feel like a reveal rather than a cold start.

## Why three distinct editor layouts?

Each output type has a fundamentally different interaction model:

- **Social posts and presentations** are visual, frame-based — a canvas with layers and properties is the right tool
- **Docs and image libraries** are linear or grid-organized content — a document/folder metaphor fits better
- **Apps** are component-based page structures — a component tree and live preview is what the user needs

Forcing all products into one editor layout would either constrain the most capable products or overwhelm users of the simpler ones.

---

# Non-Goals

- Brand Kit setup and editing → see Brand Kit PRD
- Homepage experience → see Homepage PRD
- Returning user flows (editing existing projects, project history)
- Multi-brand / workspace management
- Pricing, plan gates, usage limits
- Native mobile app (out of scope; web is desktop-only by design)
- Share, export, and publish functionality (UI present; out of scope for this PRD)

---

# Open Questions

| # | Question | Owner | Status |
| --- | --- | --- | --- |
| 1 | What is the exact breakpoint that triggers the Device Gate — viewport width, user agent, or both? The current implementation needs a defined threshold. | Engineering | Open |
| 2 | Should the Device Gate appear for tablets (e.g. iPad in landscape)? Tablets may have sufficient screen size for the canvas editor. | Product / Design | Open |
| 3 | The Outline Editor is currently scoped to Social Post. How does it adapt for Presentation (slides vs posts), Docs (sections vs posts), or Space (image prompts)? | Product / Design | Open |
| 4 | Should the Agent Chat questions (platform, tone, count) change per product, or stay consistent? Currently they are drawn from per-product config but the form UI is the same. | Product | Open |
| 5 | After "Confirm & Generate," how does the editor receive the outline content? The prototype navigates to `/editor/:slug` with no data passed. | Engineering | Open |
| 6 | The Theme Library appears before any brand kit exists for a new user. Is there a dependency on Brand Kit setup before this flow is meaningful? | Product | Open |
| 7 | The Back button on the Prompt Screen returns to `/onboarding`. Should it return to `/home` instead for users who entered from the homepage? | Design | Open |
| 8 | Design and App are "Coming Soon" in Step 3B but fully accessible via direct URL (`/create/design`, `/create/app`). Is this intentional for internal access? | Product | Open |
