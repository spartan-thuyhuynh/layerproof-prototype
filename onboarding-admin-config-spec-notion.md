# Onboarding — Admin Config Spec

Tất cả các field trong onboarding flow và in-editor walkthrough có thể update qua admin dashboard mà không cần deploy code. Giao danh sách này cho dev để setup.

**17 config groups** · Onboarding + In-editor · Cập nhật tháng 6/2026

---

## Mức độ ưu tiên

| Badge | Ý nghĩa |
|---|---|
| P1 | Làm trước — thay đổi nhiều nhất |
| P2 | Giá trị cao |
| P3 | Trung bình |
| P4 | Ít thay đổi |
| P5 | Hầu như không thay đổi |

---

## UI Pattern Types — Media & Toggle trong Admin Dashboard

Mục tiêu: tất cả image, GIF, video liên quan đến onboarding đều được quản lý qua admin dashboard — bật/tắt, thay link, không cần deploy code.

| Pattern | Dùng ở đâu | Media slot / Toggle |
|---|---|---|
| Modal / Dialog | Brand Kit hook screen (Step 4), Completion screen (Step 9) | Illustration image hoặc animation GIF — toggle hiển thị/ẩn, thay link |
| Slideshow / Carousel | Hero feature carousel (left panel wizard, Group 2) | Static image hoặc animated WebP per tab — reorder, bật/tắt từng tab |
| Product Card | Product selection step (Group 1) | Thumbnail image per product — swap image URL, toggle "Coming Soon", reorder card |
| Spotlight Tour | In-editor walkthrough (Group 16) | GIF hoặc short video per step — toggle toàn bộ tour on/off, bật/tắt từng step |
| Progress Chip | In-editor bottom-right chip (Group 17) | Toggle hiển thị/ẩn chip, đổi label và màu progress bar |
| Tooltip / Nudge | Product selection nudge (Group 1 page copy) | Toggle bật/tắt, đổi delay (ms) và nội dung text |
| Animated Banner | Left panel gradient identity | Gradient color per product — có thể mở rộng để nhận GIF/video background |
| Video Modal | Có thể thêm vào bất kỳ step nào (future) | Embed URL (YouTube/Loom) — toggle hiển thị, autoplay on/off |

---

## Configurable Field Groups

---

### 01 — Sub-Product Catalog `P1`

Các product card hiển thị trên screen chọn product (Step 5). Thay đổi mỗi khi thêm product mới, đổi tên, hoặc reorder.

**Source:** `src/features/onboarding/components/steps/Step3_Product.tsx → PRODUCTS[]` · `public/home/card-*.png`

| Field | Type | Ví dụ |
|---|---|---|
| Product name | Text | "LayerProof Matte" |
| Sub-label / category | Text | "Social Post Generator" |
| Short description | Text | "AI-powered posts for Instagram, LinkedIn & beyond" |
| Thumbnail image | Image | card-social-post.png |
| "Coming Soon" badge | Toggle | true / false |
| Display order | Number | 1, 2, 3… |
| Visible / hidden | Toggle | true / false |
| Internal slug (routing key) | Text | social-post, presentation, space |
| Icon type | List | Social, Present, Layers, Docs, Globe, Sparkle |

**Page Copy**

| Field | Type | Ví dụ |
|---|---|---|
| Eyebrow label | Text | "Welcome to LayerProof" |
| Page headline | Text | "How would you like to get started?" |
| Page subtitle | Text | "Pick a product to dive into — you can explore everything else from your dashboard." |
| Nudge tooltip text | Text | "Not sure? Start here!" |
| Nudge delay (ms) | Number | 7000 |
| "Coming Soon" badge text | Text | "Coming Soon" |

> Mỗi product là một record riêng. Admin có thể thêm product mới, bật/tắt hiển thị, sắp xếp lại card, và đổi image thumbnail mà không cần release code.

---

### 04 — Role / Intent Options `P2`

Các chip option hiển thị ở Step 2 — "What best describes your job?" Dùng để personalize onboarding và segment analytics.

**Source:** `src/features/onboarding/components/steps/Step2_Intent.tsx → ROLES[]`

| Field | Type | Ví dụ |
|---|---|---|
| Role label | Text | "Marketing", "Student", "Designer" |
| Role internal ID | Text | marketing, student, designer |
| Display order | Number | 1, 2, 3… |
| Visible / hidden | Toggle | true / false |
| Step headline | Text | "What best describes your job?" |
| Step subtitle | Text | "Customize LayerProof for your role." |
| "Other" field placeholder | Text | "Tell us more…" |
| Skip button label | Text | "Skip for now" |

---

### 05 — Referral Source Options `P2`

Các chip option ở Step 2 sub-step 2 — "How did you hear about us?" Thêm/bỏ channel (vd: new social platform) mà không cần thay đổi code.

**Source:** `src/features/onboarding/components/steps/Step2_Intent.tsx → REFERRALS[]`

| Field | Type | Ví dụ |
|---|---|---|
| Source label | Text | "Product Hunt", "TikTok", "LinkedIn" |
| Source internal ID | Text | producthunt, tiktok, linkedin |
| Display order | Number | 1, 2, 3… |
| Visible / hidden | Toggle | true / false |
| Step headline | Text | "How did you hear about us?" |
| Step subtitle | Text | "We'd love to know how you found LayerProof." |

---

### 16 — In-Editor Walkthrough Tour `P2`

Tour spotlight 5 step kích hoạt khi user vào editor lần đầu (PromptScreen). Mỗi step highlight một UI element bằng pulsing spotlight và tooltip. Cũng bao gồm InputTip sequence 2 step cho attach file và model switcher.

**Source:** `src/features/create/components/PromptScreen.tsx → TOUR_STEPS[]`

**Tour spotlight 5 step**

| Field | Type | Ví dụ |
|---|---|---|
| Step title | Text | "Not sure where to start?" |
| Step body copy | Text | "Pick a suggestion to fill your prompt instantly…" |
| Step target element | Text | suggestions, attach, model, style, generate |
| Step order | Number | 1, 2, 3, 4, 5 |
| Step visible / hidden | Toggle | true / false |
| "Skip tour" button label | Text | "Skip tour" |
| "Next" button label | Text | "Next →" |
| Tour enabled (global toggle) | Toggle | true / false — turn off for existing users |

**Chuỗi InputTip 2 step (attach file + model switcher)**

| Field | Type | Ví dụ |
|---|---|---|
| Step 1 body text | Rich Text | "**Attach a file** to give the AI more context…" |
| Step 1 counter label | Text | "1 of 2" |
| Step 1 button label | Text | "Next →" |
| Step 2 body text | Rich Text | "**Switch AI model** to match your task…" |
| Step 2 counter label | Text | "2 of 2" |
| Step 2 button label | Text | "Got it" |

> Global toggle rất quan trọng — cho phép chạy A/B test trên tour, hoặc disable cho returning user trong campaign re-onboarding.

---

### 19 — In-Editor Walkthrough (per sub-product) `P2`

Mỗi sub-product editor có thể có walkthrough riêng khi user lần đầu mở. Có 2 pattern: Spotlight tooltips (highlight từng element) hoặc Intro carousel modal (dialog giữa màn hình). Admin bật/tắt và config content từng loại per product.

**Source:** `src/features/create/components/MatteV3Editor.tsx`, `SpaceEditor.tsx`, … (per product)

**Pattern A — Spotlight Tour (tooltips targeting UI elements)**

| Field | Type | Ví dụ |
|---|---|---|
| Enable spotlight tour | Toggle | true / false per sub-product |
| Step title | Text | "Not sure where to start?" |
| Step body | Text | "Pick a suggestion to fill your prompt instantly." |
| Target element key | Text | suggestions, toolbar, generate, theme-picker |
| Step order | Number | 1, 2, 3… |
| "Skip tour" button label | Text | "Skip tour" |
| "Next" button label | Text | "Next →" |
| Trigger condition | Toggle | first-visit only / always |

**Pattern B — Intro Carousel Modal (center dialog, multi-slide)**

| Field | Type | Ví dụ |
|---|---|---|
| Enable intro modal | Toggle | true / false per sub-product |
| Slide title | Text | "Introducing Space" |
| Slide subtitle | Text | "One canvas for every image asset you need" |
| Slide media | Image | GIF hoặc static image minh hoạ feature |
| Slide order / total count | Number | 1 of 4, 2 of 4… |
| "Skip" button label | Text | "Skip" |
| "Next" button label | Text | "Next →" |
| "Done" button label (last slide) | Text | "Get started" |
| Trigger condition | Toggle | first-visit only / always |

---

### 18 — Prompt Screen `P2`

Screen đầu tiên user thấy sau khi chọn sub-product. Headline và subtitle thay đổi theo từng product.

**Source:** `src/features/create/config.ts → ProductConfig (promptTitle, promptSub)`

| Field | Type | Ví dụ (per sub-product) |
|---|---|---|
| Page headline | Text | "What do you want to {create}?" — hỗ trợ inline highlight qua {word} |
| Page subtitle | Text | "Describe your social post — tone, format, and context." |

---

### 02 — Hero Feature Carousel `P3`

Các tab preview product rotating ở left panel của onboarding wizard. Tự động chuyển mỗi 7 seconds.

**Source:** `src/features/onboarding/components/OnboardingWizard.tsx → HERO_TABS[]` · `public/home/feature-*.png`

| Field | Type | Ví dụ |
|---|---|---|
| Tab label | Text | "Social Post" |
| Feature headline | Text | "Multiple creative directions in minutes" |
| Feature sub-copy | Text | "Test dozens of hooks and visual styles…" |
| Hero image per tab | Image | feature-presentation.png |
| Tab linked product slug | Text | social-post, presentation, space |
| Display order | Number | 1, 2, 3… |

---

### 17 — In-Editor Progress Chip `P4`

Chip cố định góc dưới phải hiển thị "Get started · 1/5" trong khi user hoàn thành các onboarding step đầu tiên trong editor.

**Source:** `src/features/create/components/MatteV3Editor.tsx → onboarding chip`

| Field | Type | Ví dụ |
|---|---|---|
| Chip label text | Text | "Get started" |
| Total steps count | Number | 5 |
| Progress bar color | Color | #fbbf24 (yellow) |
| Help button tooltip text | Text | "?" |
| Chip visible / hidden | Toggle | true / false |

---

### 08 — Brand Kit Setup (Step 4) `P5`

Toàn bộ config cho Step 4 — gồm page copy (hook screen, setup form, done screen), loading animation steps, và toggle hiển thị/skip bước này.

**Source:** `src/features/onboarding/components/steps/Step4_BrandName.tsx → GENERATING_STEPS[]`

**Loading Animation Steps**

| Field | Type | Ví dụ |
|---|---|---|
| Step label (headline) | Text | "Saving your colour palette" |
| Step sub-copy | Text | "Your brand kit now owns these colours…" |
| Display interval (ms) | Number | 900 |
| Show Brand Kit step | Toggle | true = hiển thị Step 4, false = skip hoàn toàn |

**Phase 1 — Hook screen**

| Field | Type | Ví dụ |
|---|---|---|
| Eyebrow | Text | "Brand kit" |
| Headline | Text | "Set up your own brand" |
| Subtitle | Text | "Upload your logo, pick your colors and type…" |
| Note text | Text | "You can always adjust your brand kit later." |
| Primary CTA | Text | "Yes, set up my brand" |
| Secondary CTA | Text | "I'll set it up later" |
| Illustration image | Image | onboarding/illustration.png |

**Phase 2 — Setup form**

| Field | Type | Ví dụ |
|---|---|---|
| Default brand color swatch | Color | #ec4899 |
| Brand name placeholder | Text | "e.g. Acme Studio" |
| Primary CTA | Text | "Generate my brand kit" |

**Phase 3 — Done screen**

| Field | Type | Ví dụ |
|---|---|---|
| Eyebrow | Text | "Theme Generated" |
| Headline | Text | "Your brand kit is ready." |
| Subtitle | Text | "We've auto-generated your first brand theme from your kit…" |
| Primary CTA | Text | "Generate your first project" |

---

### 14 — Mobile Gate Copy `P5`

Screen hiển thị cho user mobile yêu cầu chuyển sang desktop. URL hiển thị và mobile breakpoint cũng cần configurable.

**Source:** `src/features/onboarding/components/steps/Step3_DeviceGate.tsx`

| Field | Type | Ví dụ |
|---|---|---|
| Heading | Text | "Finish setup on desktop" |
| Body message | Text | "LayerProof is built for desktop — the full creative experience needs a bigger screen." |
| URL displayed to user | Text | "layerproof.com/onboarding" |
| Copy link button label | Text | "Copy link" |
| Hint text | Text | "Already have an account? Log in on your desktop…" |
| Mobile breakpoint (px) | Number | 768 |

---

## Implementation Notes

Store all of the above in a single admin config document (e.g. Firestore `config/onboarding` or a CMS). Load it once at app boot and pass it down via context. Admin dashboard provides a CRUD UI per group. No code deploy required to update content.

**Priority order for dev:**
1. Group 01 — Sub-product catalog + thumbnails (most frequently updated)
2. Groups 16 & 19 — In-editor walkthrough tour + per-product walkthrough
3. Groups 04 & 05 — Role and referral options
4. Groups 02 & 18 — Hero carousel + prompt screen copy
5. Group 17 — Progress chip
6. Groups 08 & 14 — Lower-frequency copy fields
