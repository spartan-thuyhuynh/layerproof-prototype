export type AgentTurn = {
  message: string
  chips?: string[]
  inputPlaceholder?: string
  isFinal?: boolean
}

export type ProductConfig = {
  label: string
  slug: string
  color: string
  icon: string
  gradient: string
  promptTitle: string
  promptSub: string
  promptPlaceholder: string
  agentScript: AgentTurn[]
  editorType: 'canvas' | 'document' | 'builder'
}

const GRADIENT = 'radial-gradient(ellipse at 10% 65%, rgba(236,72,153,0.65) 0%, transparent 50%), radial-gradient(ellipse at 82% 18%, rgba(200,145,0,0.28) 0%, transparent 42%), #060106'
const COLOR = '#F5C518'

export const PRODUCT_CONFIGS: Record<string, ProductConfig> = {
  'social-post': {
    label: 'Social Post',
    slug: 'social-post',
    color: COLOR,
    icon: 'Social',
    gradient: GRADIENT,
    promptTitle: 'What {post} will your audience love?',
    promptSub: 'Tell us what to say — we\'ll craft posts that stop the scroll and build your brand.',
    promptPlaceholder: 'e.g. Summer sale campaign for a coffee brand, warm and inviting tone…',
    editorType: 'canvas',
    agentScript: [
      {
        message: "Got it! I'll create a social media campaign for you. Which platform are you targeting?",
        chips: ['Instagram', 'LinkedIn', 'X (Twitter)', 'All Platforms'],
      },
      {
        message: 'What format would you like for this post?',
        chips: ['Single Image', 'Carousel'],
      },
      {
        message: 'What tone should this content have?',
        chips: ['Professional', 'Casual & Friendly', 'Bold & Direct', 'Playful'],
      },
      {
        message: 'How many post variations would you like me to generate?',
        chips: ['1 variation', '3 variations', '5 variations'],
      },
      {
        message: "Perfect! I've set up your Social Post workspace with your preferences. Ready to open the editor?",
        isFinal: true,
      },
    ],
  },
  'docs': {
    label: 'Docs',
    slug: 'docs',
    color: COLOR,
    icon: 'Docs',
    gradient: GRADIENT,
    promptTitle: 'What idea should be {written} down?',
    promptSub: 'Describe the document — we\'ll structure it with your voice and ship it faster.',
    promptPlaceholder: 'e.g. Q3 product roadmap for a SaaS startup, executive summary style…',
    editorType: 'document',
    agentScript: [
      {
        message: "Great! I'll help you create a polished document. What type of document is this?",
        chips: ['Report / Analysis', 'Proposal', 'Team Wiki', 'Meeting Notes'],
      },
      {
        message: 'Who is the primary audience for this document?',
        chips: ['Internal team', 'Executive leadership', 'Clients / External', 'Public'],
      },
      {
        message: 'Should I apply your brand guidelines to this document?',
        chips: ['Yes, use brand kit', 'Keep it minimal', 'Custom styling'],
      },
      {
        message: "Your document workspace is ready! I've structured the outline based on your inputs.",
        isFinal: true,
      },
    ],
  },
  'space': {
    label: 'Space',
    slug: 'space',
    color: COLOR,
    icon: 'Layers',
    gradient: GRADIENT,
    promptTitle: 'What image will you {generate} today?',
    promptSub: 'Describe your vision — we\'ll generate stunning on-brand visuals in seconds.',
    promptPlaceholder: 'e.g. Brand asset hub for a design team, organized by campaign…',
    editorType: 'document',
    agentScript: [
      {
        message: "I'll set up a collaborative brand space for you. What is this Space primarily for?",
        chips: ['Asset library', 'Campaign hub', 'Team workspace', 'Client portal'],
      },
      {
        message: 'Who should have access to this Space?',
        chips: ['Just me', 'My team', 'Entire org', 'Invite specific people'],
      },
      {
        message: 'How would you like the content organized?',
        chips: ['By project', 'By content type', 'By date', 'Custom folders'],
      },
      {
        message: "Your Space is configured and ready! All your brand assets will live here.",
        isFinal: true,
      },
    ],
  },
  'presentation': {
    label: 'Presentation',
    slug: 'presentation',
    color: COLOR,
    icon: 'Present',
    gradient: GRADIENT,
    promptTitle: 'What idea will you {present} next?',
    promptSub: 'Tell us what to pitch — we\'ll build a deck that commands the room.',
    promptPlaceholder: 'e.g. Investor pitch deck for a Series A startup, 10 slides, modern style…',
    editorType: 'canvas',
    agentScript: [
      {
        message: "I'll create a stunning presentation for you. What's the main purpose of this deck?",
        chips: ['Pitch / Fundraising', 'Sales deck', 'Team briefing', 'Product demo'],
      },
      {
        message: 'How many slides are you aiming for?',
        chips: ['5–8 slides', '10–12 slides', '15–20 slides', 'Let AI decide'],
      },
      {
        message: 'What visual style fits best?',
        chips: ['Clean & minimal', 'Bold & impactful', 'Data-rich', 'Storytelling'],
      },
      {
        message: "Your presentation deck is structured and ready. Let's start building your slides!",
        isFinal: true,
      },
    ],
  },
  'design': {
    label: 'Design',
    slug: 'design',
    color: COLOR,
    icon: 'Sparkle',
    gradient: GRADIENT,
    promptTitle: 'What brand will you {design} today?',
    promptSub: 'Describe the visual — we\'ll create brand-perfect assets at any scale.',
    promptPlaceholder: 'e.g. Banner ads for a product launch, 3 sizes, minimalist look…',
    editorType: 'canvas',
    agentScript: [
      {
        message: "Let's create some great visuals. What type of design are you making?",
        chips: ['Banner / Ad', 'Logo & brand mark', 'Illustration', 'UI mockup'],
      },
      {
        message: 'What format or dimensions do you need?',
        chips: ['Social media sizes', 'Print / A4', 'Web banners', 'Custom size'],
      },
      {
        message: 'Should I pull colors and fonts from your brand kit?',
        chips: ['Yes, use brand kit', 'Start fresh', 'Mix both'],
      },
      {
        message: "Your design canvas is ready with the right format and brand settings applied.",
        isFinal: true,
      },
    ],
  },
  'app': {
    label: 'App',
    slug: 'app',
    color: COLOR,
    icon: 'Globe',
    gradient: GRADIENT,
    promptTitle: 'What experience will you {build} next?',
    promptSub: 'Describe the experience — we\'ll build the page that converts visitors into customers.',
    promptPlaceholder: 'e.g. Landing page for a SaaS product, conversion-focused with demo CTA…',
    editorType: 'builder',
    agentScript: [
      {
        message: "I'll help you build an interactive experience. What type of app or page is this?",
        chips: ['Landing page', 'Dashboard', 'Portfolio', 'Interactive demo'],
      },
      {
        message: 'What is the primary goal of this page?',
        chips: ['Generate leads', 'Showcase product', 'Drive sign-ups', 'Tell a story'],
      },
      {
        message: 'What device should it be optimized for?',
        chips: ['Desktop first', 'Mobile first', 'Both equally'],
      },
      {
        message: "Your app workspace is ready! The layout has been pre-configured for your goals.",
        isFinal: true,
      },
    ],
  },
}
