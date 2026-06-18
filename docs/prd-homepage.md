# PRD: New Homepage

**Document type:** Product Requirements Document  
**Audience:** Development team  
**Status:** Draft — v1.0  
**Date:** 2026-06-17

---

## Overview

This document describes the new LayerProof homepage (`/home`) — its sections, the product thinking behind each design decision, and the problems each change solves. The homepage is the first screen a returning user lands on after onboarding. It must orient users quickly, surface the right creation entry points, and reflect the breadth of LayerProof as a platform — not just a single-product tool.

> 📷 **[IMAGE: Full homepage screenshot — annotated with section labels]**

---

## Background & Motivation

User session replay and product analytics show a consistent drop-off pattern on the current homepage: users land on the screen, do not interact, and exit without starting a creation flow. The data indicates users are not failing at a specific step — they are uncertain what to do next from the moment they arrive. The homepage does not communicate what the product does, what options are available, or where to start.

This redesign directly addresses that drop-off. Every section and decision in this document is driven by the goal of reducing confusion at the homepage and converting more landing sessions into active creation sessions.

## Product Goals

1. **Increase creation rate** — reduce the number of users who land on the homepage and exit without starting a project.
2. **Reduce confusion at first view** — every section of the homepage should give the user a clear signal of what to do next, with no dead ends.
3. **Reduce time-to-create** — users should be able to start a new project in under 2 clicks from the homepage.
4. **Communicate product scope** — LayerProof offers Social Posts, Docs, Presentations, Design, Apps, and AI tools. The homepage must make all of these discoverable without overwhelming the user.
5. **Reinforce re-engagement** — returning users should see their recent work immediately and feel productive context being restored.
6. **Introduce new features** — the homepage is the primary in-product surface for announcing new capabilities (e.g. Brand Kit, Vellum).

---

## Page Structure

The homepage is split into two persistent regions: the **Sidebar** (fixed left panel) and the **Main Content Area** (scrollable). Together they make up the full homepage experience.

> 📷 **[IMAGE: Page layout wireframe — sidebar on left, main content on right]**

---

## 1. Sidebar

**Type:** Persistent layout component  
**Visible on:** All authenticated pages

### What it is

A fixed vertical panel divided into six zones, top to bottom:

| Zone | Contents |
|---|---|
| Brand header | LayerProof logo, wordmark, workspace grid icon |
| Create button | "Create new design" CTA — opens product dropdown |
| Primary nav | Home, All Workspaces |
| Brand section | Brand Kit (NEW), Theme, Tones |
| Tools section | AI Tools, Schedule |
| User footer | Avatar, display name, email, notifications bell, theme toggle, log out |

> 📷 **[IMAGE: Sidebar — full view with zones labelled]**

### Create dropdown & hover preview

Clicking "Create new design" opens a dropdown listing all six creation products. Hovering any item reveals a side preview panel showing a stylised thumbnail, product description, and three feature bullets.

> 📷 **[IMAGE: Sidebar create dropdown — open state, with hover preview panel visible]**

### Problem

Without a persistent navigation surface, users must return to the homepage to switch products or access brand settings. A top navbar collapses product-level navigation into a single row that doesn't scale as the product surface grows.

### Solution

- The sidebar is always visible across all authenticated pages, giving users a stable orientation anchor regardless of their current page.
- Labelled sections (Brand, Tools) help users build a mental model of the product — brand management is distinct from creation tools.
- "Create new design" is the topmost interactive element below the wordmark so it is the most prominent action at all times, not buried in a nav list.
- The hover preview panel collapses product discovery and navigation into a single interaction — no need to visit a dedicated product page before deciding.
- The "NEW" badge on Brand Kit in the sidebar reinforces the homepage announcement chip. Users who miss the chip will encounter the signal again in the nav.

---

## 2. Welcome Header & Project Creation

**Location:** Top of the main content area, spanning the welcome header, feature cards, and sub-products row

### What it is

This section is the primary creation zone of the homepage. It consists of three stacked elements that together answer the question a dropped-off user couldn't answer on their own: *what can I make, and where do I start?*

> 📷 **[IMAGE: Full creation zone — welcome header, feature cards, and sub-products row together]**

---

**Welcome header**

A large typographic headline — *"What do you want to create today?"* — paired with an animated announcement chip. The chip shows "New" and a rolling label for the latest feature launch (currently Brand Kit), with an arrow indicating it is tappable.

> 📷 **[IMAGE: Welcome header — headline and announcement chip]**

---

**Feature cards (primary products)**

A row of three large cards, each representing a top creation use case surfaced from user data. Each card shows a thumbnail screenshot of real product output, a product label chip, a benefit-oriented headline, and a short description. Clicking navigates to the corresponding create flow (`/create/:slug`).

The three products shown — **Social Post**, **Docs**, and **Space** — are the most frequently created project types across the user base. The card headlines and descriptions ("Generate Social Media Content", "Generate Blogs & Articles", "Combine Images & Ideas") are written in use-case language drawn from real user prompt patterns, not generic feature names.

> 📷 **[IMAGE: Feature cards — all three cards visible]**

> 📷 **[IMAGE: Feature card — hover state]**

---

**Sub-products row (secondary products)**

A horizontal row of four pill-style buttons: Presentation, Design, App, and AI Tools. Each pill contains a product icon, a label, and a one-line description. AI Tools includes a chevron to signal it opens an expanded view rather than navigating directly to a create flow.

These four products are lower in creation volume than the primary three but serve a meaningful segment of users. Like the feature cards, their order reflects usage frequency.

> 📷 **[IMAGE: Sub-products row — all four pills]**

---

**Sidebar: "Create new design" (persistent entry point)**

In addition to the homepage cards and pills, the sidebar provides an always-available creation entry point across all pages. Clicking "Create new design" opens a dropdown listing all six products. Hovering any item reveals a preview panel with a thumbnail, product description, and feature bullets.

> 📷 **[IMAGE: Annotated screenshot — three creation entry points highlighted across sidebar and homepage]**

| Entry Point | Available on | Products | User intent served |
|---|---|---|---|
| Sidebar "Create new design" | All pages | All 6 | High-intent — knows what they want |
| Feature cards | Homepage | Social Post, Docs, Space | Responding to a visual prompt |
| Sub-products row | Homepage | Presentation, Design, App, AI Tools | Exploring, lower intent |

### Problem

User session replay and drop-off data show users arriving at the homepage and leaving without creating. Two root causes drive this:

1. **No clear starting point** — the previous homepage listed product names without showing what those products produce or what a user could accomplish with them. Users couldn't connect their intent to a product.
2. **Single creation path** — if a user missed or ignored the main CTA, there was no secondary surface to catch them. Users inside a create flow also had no way to start a fresh project without navigating back to the homepage.

### Solution

- The headline is phrased as a prompt, not a greeting — it frames the entire section as an action surface from the first moment.
- Feature cards use **use-case language and real output thumbnails** so users can match their intent to a product visually, before clicking.
- Cards and pills are **ordered by creation frequency from user data**, putting the highest-traffic paths first.
- Three distinct entry points (sidebar, feature cards, sub-products row) serve different user states without redundancy — each is placed where it matches the user's mindset (persistent for high-intent, visual for discovery, compact for exploration).
- The announcement chip surfaces the latest feature launch inline, without a modal or interstitial.

> 🔮 **Future: Personalised cards** — In a later iteration, the cards and pills shown will be tailored per user based on their last project creation and most-used product types. The current version uses global usage frequency (same for all users). This is out of scope for this version.

---

## 3. New Sub-Product Banner

**Location:** Between the sub-products row and Recent Projects

### What it is

A full-width promotional banner that highlights the most recently launched sub-product. The banner is a **reusable slot** — it is not hardwired to any single product. Its content (background image, product chip, name, tagline, accent colours) is updated each time a new sub-product ships.

Default state: a background image with gradient overlay, decorative colour orbs, a product chip, the product name, and a tagline. Hover state: the background blurs, the title fades out, and two action buttons appear — "Try it" and "Read release note."

The current occupant is **Vellum** (AI-powered image generation, under the Space product), used here as the reference example.

> 📷 **[IMAGE: Sub-product banner — default (resting) state, current featured product visible]**

> 📷 **[IMAGE: Sub-product banner — hover state with "Try it" and "Read release note" buttons visible]**

### Problem

New sub-products go unnoticed when they are only announced in a changelog or tooltip. There is no dedicated homepage surface that can promote a launch with enough visual weight to signal its significance, without placing it so high that it intercepts users who already know what they want to create.

### Solution

- The banner is a **generic promotional slot**, not a permanent fixture for any one product. Once the featured sub-product is no longer new, the banner content is updated to the next launch — or the banner is removed if there is nothing to promote.
- Positioning after all creation entry points ensures high-intent users are not intercepted. The banner targets users who have already scanned the page and are open to exploring something new.
- The hover-to-reveal interaction keeps the default state clean and engaging, surfacing action buttons only when the user shows intent.
- Two actions serve two user types: "Try it" for users ready to explore immediately, "Read release note" for users who want context before committing.
- Decorative colour orbs should use the featured sub-product's accent colours, not a fixed palette — making the banner visually distinct for each product it promotes.

---

## 4. Recent Projects

**Location:** Below the sub-product banner

### What it is

A section titled "Pick up where you left off" showing a single row of four project cards. Each card contains a colour-coded thumbnail with a product icon, the workspace name, the project title, a content type badge, and a last-viewed or last-edited timestamp. A "View All" link is available at the top right.

> 📷 **[IMAGE: Recent projects row — four cards visible]**

> 📷 **[IMAGE: Recent project card — annotated with field labels]**

### Problem

Returning users with in-progress work have no fast path to resume it. Without a recents surface, re-opening a project requires navigating to a projects list and searching by name or date — adding unnecessary friction and breaking creative momentum.

### Solution

- Showing four cards covers the most common return patterns (last project, last few active projects) without creating a long list that competes with the rest of the homepage.
- Content type badges (Social Post, Presentation, Docs) use the same colour coding as the feature cards and sidebar, so users can visually identify project types at a glance before reading titles.
- Workspace name appears above the title to help users with multiple workspaces quickly locate context.
- "Last viewed / last edited" timestamps let users distinguish projects they only viewed from ones they actively changed.
- "View All" is a secondary action — available but not competing with the primary create actions above it.

> ⚠️ **Known issue:** Workspace names currently render as raw ISO timestamps (e.g. `Workspace 2026-06-05T07:40:25.377831566Z`). These must be replaced with human-readable workspace names from the user's account data before ship.

---

## 5. Community Section

**Location:** Bottom of the homepage, below Recent Projects

### What it is

A section titled "Presentations from the community" showing a 4-card grid of publicly shared projects from other LayerProof users. Each card shows a thumbnail, a workspace label, the project title, a content type badge, and a star (like) count. Two inline filter dropdowns control language (English, Spanish, French) and sort order (Votes, Recent, Popular). A "View All" link navigates to the full community view.

> 📷 **[IMAGE: Community section — header with filters and 4-card grid]**

> 📷 **[IMAGE: Community card — annotated with field labels]**

### Problem

New and returning users have no social signal showing what other users are building with the platform. Without this, users can't assess output quality before committing to a creation flow, and there is no mechanism for ideas to cross-pollinate between workspaces.

### Solution

- Community content provides social proof — seeing real projects from real users validates the platform's output quality before a user has invested time creating their own.
- Limiting to 4 cards on the homepage keeps the section from dominating the page. The primary user action on the homepage is still "create", not "browse."
- Language and sort filters are surfaced inline so users can personalise the feed without leaving the homepage.
- Star counts provide a lightweight quality signal without requiring a full reputation or rating system.

> ⚠️ **Note:** Community data is currently mocked. Integration with a real community feed endpoint is required before this section is production-ready.

---

## Section Order Rationale

| Order | Section | Why here |
|---|---|---|
| — | Sidebar | Persistent across all pages; outside the homepage scroll order |
| 1 | Welcome Header & Project Creation | Primary action zone — answers "what can I make and where do I start?"; must be first |
| 2 | New Sub-Product Banner | Feature promotion placed after the creation zone so it doesn't intercept high-intent users |
| 3 | Recent Projects | Re-engagement for returning users; less relevant on a first visit |
| 4 | Community | Social proof and inspiration; passive consumption — intentionally last |

---

## Out of Scope (this version)

- Global search / project search bar
- Notifications feed
- **Personalised feature cards** — tailoring the cards and sub-products row to each user based on their last project creation and most-used product types. The current version uses global usage frequency (same for all users). Personalisation is the planned next iteration.
- Mobile-responsive layout
- Empty state when the user has no recent projects
- Empty state when the community feed returns no results

---

## Open Questions

1. Should the Vellum banner be dismissible (close button persisted via localStorage or user preference)?
2. Should the community section be hidden until a user has at least one project, to avoid a cold-start empty state on day 1?
3. What replaces the Vellum banner once Vellum is no longer a new feature — is there a general-purpose promo slot, or is the banner removed entirely?
4. Who owns updating the "New" chip in the Welcome Header when the next feature launches, and what is the process for rotating it?
