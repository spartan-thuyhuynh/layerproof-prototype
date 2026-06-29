import { useState } from 'react'
import { useEditor, EditorContent, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'
import type { NodeViewProps } from '@tiptap/react'
import { Node, mergeAttributes } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TipTapImage from '@tiptap/extension-image'
import type { BrandKit } from '@/features/brand-kit/types/brand'
import type { EditorActions } from './types'
import { Portal } from '@/shared/lib/Portal'
import { Download, Pencil, FileText, Check, RotateCcw, RotateCw, X, Image as ImageIcon } from '@/shared/icons'

interface GuidelineProps {
  kit: BrandKit
  ed: EditorActions
}

/* ── Inline-style helpers (used in HTML string so they work in dangerouslySetInnerHTML) ─── */
const ROW  = 'display:flex;flex-wrap:wrap;gap:12px;margin:14px 0;'
const GRID = (cols: number) =>
  `display:grid;grid-template-columns:repeat(${cols},1fr);gap:10px;margin:14px 0;`

/* ── VisualBlock — non-editable rendered asset blocks in TipTap ── */
const encV = (html: string) => { try { return btoa(unescape(encodeURIComponent(html))) } catch { return '' } }
const decV = (b64: string) => { try { return decodeURIComponent(escape(atob(b64))) } catch { return '' } }

function VisualBlockView({ node }: NodeViewProps) {
  return (
    <NodeViewWrapper contentEditable={false} style={{ userSelect: 'none' }}>
      <div style={{ pointerEvents: 'none' }} dangerouslySetInnerHTML={{ __html: node.attrs.html as string }} />
    </NodeViewWrapper>
  )
}

const VisualBlock = Node.create({
  name: 'visualBlock',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      html: {
        default: '',
        parseHTML: (el) => decV(el.getAttribute('data-v') ?? '') || (el as HTMLElement).innerHTML,
        renderHTML: (attrs) => ({ 'data-v': encV(attrs.html as string) }),
      },
    }
  },
  parseHTML() { return [{ tag: 'div[data-visual]' }] },
  renderHTML({ HTMLAttributes }) { return ['div', mergeAttributes({ 'data-visual': '' }, HTMLAttributes)] },
  addNodeView() { return ReactNodeViewRenderer(VisualBlockView) },
})

/* ── TaglineBlock — editable tagline banner ──────────────────── */
function TaglineBlockView({ node, updateAttributes }: NodeViewProps) {
  return (
    <NodeViewWrapper contentEditable={false}>
      <div style={{ margin: '20px 0', padding: '36px 32px', background: '#e8e8e8', borderRadius: '14px', textAlign: 'center' }}>
        <div
          contentEditable
          suppressContentEditableWarning
          style={{ fontSize: '32px', fontWeight: 600, letterSpacing: '.04em', color: '#111', lineHeight: 1.15, marginBottom: '8px', outline: 'none', cursor: 'text' }}
          onBlur={(e) => updateAttributes({ text: e.currentTarget.textContent ?? '' })}
        >
          {node.attrs.text}
        </div>
        <div style={{ fontSize: '15px', color: '#666' }}>{node.attrs.subtitle}</div>
      </div>
    </NodeViewWrapper>
  )
}

const TaglineBlock = Node.create({
  name: 'taglineBlock',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      text: {
        default: 'Your Brand Tagline Here',
        parseHTML: (el) => (el as HTMLElement).getAttribute('data-text') ?? 'Your Brand Tagline Here',
        renderHTML: (attrs) => ({ 'data-text': attrs.text }),
      },
      subtitle: {
        default: 'Subtitles support your statement',
        parseHTML: (el) => (el as HTMLElement).getAttribute('data-subtitle') ?? 'Subtitles support your statement',
        renderHTML: (attrs) => ({ 'data-subtitle': attrs.subtitle }),
      },
    }
  },
  parseHTML() { return [{ tag: 'div[data-tagline]' }] },
  renderHTML({ HTMLAttributes }) { return ['div', mergeAttributes({ 'data-tagline': '' }, HTMLAttributes)] },
  addNodeView() { return ReactNodeViewRenderer(TaglineBlockView) },
})

/* ── HTML generator ──────────────────────────────────────────── */
export function buildGuidelineHTML(kit: BrandKit): string {
  const s: string[] = []
  const ph = (label: string) => `<p><em>No ${label} configured for this brand kit.</em></p>`

  /* ── Cover ── */
  // Logo mark
  const logoMark = kit.symbolSrc
    ? `<img src="${kit.symbolSrc}" style="width:65%;height:65%;object-fit:contain;" />`
    : `<span style="font-size:26px;font-weight:800;color:${kit.logoStyle.color};">${kit.logoText}</span>`
  const logoBox = (bg: string, size = 72, radius = 16) =>
    `<div style="width:${size}px;height:${size}px;border-radius:${radius}px;background:${bg};display:inline-flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;">${logoMark}</div>`

  s.push(
    `<div data-visual="">` +
    `<div style="${ROW}align-items:center;gap:18px;margin-bottom:8px;">` +
      logoBox(kit.symbolSrc ? '#111' : kit.logoStyle.background) +
      `<div><h1 style="margin:0 0 4px;font-size:32px;font-weight:800;letter-spacing:-.02em;">${kit.name} Brand Guidelines</h1>` +
      `<p style="margin:0;color:#aaa;font-style:italic;">Your brand tagline goes here</p></div>` +
    `</div>` +
    `</div>`,
  )

  /* ── Brand Introduction ── */
  s.push(`<h2>Brand Introduction</h2>`)

  // Purpose
  s.push(`<h3>Purpose</h3>`)
  s.push(
    `<p>This document is the official brand guideline for <strong>${kit.name}</strong> — ` +
    `a reference for anyone creating content, designing assets, or communicating on behalf of the brand. ` +
    `Following these guidelines ensures that every touchpoint reflects a consistent identity that audiences can recognize and trust.</p>`,
  )

  // About the brand
  s.push(`<h3>About the brand</h3>`)
  s.push(
    `<p>${kit.tagline ? kit.tagline + '.' : `${kit.name} is a brand built on clarity, purpose, and design.`} ` +
    `${kit.mission ?? 'Our mission drives every decision we make — from the words we use to the visuals we create.'}</p>`,
  )

  // Audience
  const hasAudience = kit.tone.ageMin || kit.tone.ageMax || kit.tone.gender || kit.tone.locations?.length
  s.push(`<h3>Target Audience</h3>`)
  if (hasAudience) {
    const parts: string[] = []
    if (kit.tone.ageMin !== undefined && kit.tone.ageMax !== undefined)
      parts.push(`ages ${kit.tone.ageMin}–${kit.tone.ageMax}`)
    else if (kit.tone.ageMin !== undefined) parts.push(`${kit.tone.ageMin}+`)
    if (kit.tone.gender) parts.push(kit.tone.gender)
    if (kit.tone.locations?.length) parts.push(kit.tone.locations.join(', '))
    s.push(`<p>Our primary audience is ${parts.join(', ')}. Every communication should feel tailored to their needs, values, and expectations.</p>`)
  } else {
    s.push(`<p><em>Describe your primary audience — who they are, what they value, and why ${kit.name} resonates with them.</em></p>`)
  }

  // Our mission & vision
  s.push(
    `<div data-visual="">` +
    `<div style="${ROW}gap:24px;margin:16px 0;">` +
    `<div style="flex:1;min-width:200px;">` +
    `<div style="font-size:13px;font-weight:700;color:#111;margin-bottom:6px;">Our Mission</div>` +
    `<div style="font-size:13px;line-height:1.7;color:#444;">${kit.mission ?? `Write a concise statement that defines what ${kit.name} does, who it serves, and how it delivers value today.`}</div>` +
    `</div>` +
    `<div style="flex:1;min-width:200px;">` +
    `<div style="font-size:13px;font-weight:700;color:#111;margin-bottom:6px;">Our Vision</div>` +
    `<div style="font-size:13px;line-height:1.7;color:#444;"><em>Describe the future ${kit.name} is striving to create and the long-term impact it aspires to make.</em></div>` +
    `</div>` +
    `</div>` +
    `</div>`,
  )

  /* ── Color Palette ── */
  s.push(`<h2>Color Palette</h2>`)
  if (kit.colors.palettes.length > 0) {
    kit.colors.palettes.forEach((pal) => {
      s.push(`<h3>${pal.name}</h3>`)
      if (pal.desc) s.push(`<p>${pal.desc}</p>`)
      // Visual swatches
      const swatches = pal.colors.map((c) =>
        `<div style="display:flex;flex-direction:column;gap:5px;min-width:80px;">` +
        `<div style="width:80px;height:52px;background:${c.hex};border-radius:10px;border:1px solid rgba(0,0,0,.08);-webkit-print-color-adjust:exact;print-color-adjust:exact;"></div>` +
        `<div style="font-size:12px;font-weight:600;color:#111;">${c.name}</div>` +
        `<div style="font-size:11px;color:#555;font-family:ui-monospace,monospace;">${c.hex}</div>` +
        `</div>`,
      ).join('')
      s.push(`<div data-visual=""><div style="${ROW}">${swatches}</div></div>`)
    })
  } else {
    s.push(ph('color palette'))
  }

  /* ── Typography ── */
  s.push(`<h2>Typography</h2>`)
  const { display, body, rules: typeRules } = kit.type
  s.push(
    `<div data-visual="">` +
    `<div style="${ROW}gap:16px;">` +
    `<div style="flex:1;min-width:200px;padding:18px;background:#f6f6f6;border-radius:10px;border:1px solid #e4e4e4;">` +
    `<div style="font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#999;margin-bottom:8px;">Display</div>` +
    `<div style="font-size:38px;font-weight:${display.weight};font-family:'${display.family}',sans-serif;line-height:1;margin-bottom:6px;color:#111;">Aa</div>` +
    `<div style="font-size:13px;font-weight:600;color:#111;">${display.family}</div>` +
    `<div style="font-size:12px;color:#888;margin-top:2px;">${display.note}</div>` +
    `</div>` +
    `<div style="flex:1;min-width:200px;padding:18px;background:#f6f6f6;border-radius:10px;border:1px solid #e4e4e4;">` +
    `<div style="font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#999;margin-bottom:8px;">Body</div>` +
    `<div style="font-size:38px;font-weight:${body.weight};font-family:'${body.family}',sans-serif;line-height:1;margin-bottom:6px;color:#111;">Aa</div>` +
    `<div style="font-size:13px;font-weight:600;color:#111;">${body.family}</div>` +
    `<div style="font-size:12px;color:#888;margin-top:2px;">${body.note}</div>` +
    `</div>` +
    `</div>` +
    `</div>`,
  )
  // Tagline & subtitle live preview (editable in editor via TaglineBlock)
  s.push(`<div data-tagline="" data-text="Your Brand Tagline Here" data-subtitle="Subtitles support your statement"></div>`)

  if (typeRules.length > 0) {
    s.push(`<ul>`)
    typeRules.forEach((r) => s.push(`<li><strong>${r.t}</strong> — ${r.d}</li>`))
    s.push(`</ul>`)
  }

  /* ── Logo Usage ── */
  s.push(`<h2>Logo Usage</h2>`)
  s.push(`<p>Minimum size: <strong>${kit.logos.minSize}</strong>. Always maintain clear space around the logo equal to the height of the logo mark.</p>`)

  // Primary logo — large banner
  s.push(`<h3>Primary logo</h3>`)
  const primaryLogoMark = kit.symbolSrc
    ? `<img src="${kit.symbolSrc}" style="height:72px;width:auto;object-fit:contain;" />`
    : `<span style="font-size:52px;font-weight:800;color:#111;">${kit.logoText}</span>`
  s.push(
    `<div data-visual="">` +
    `<div style="background:#f2f2f2;border-radius:14px;padding:52px 40px;display:flex;align-items:center;justify-content:center;gap:20px;margin:12px 0;">` +
    primaryLogoMark +
    `<span style="font-size:52px;font-weight:800;color:#111;letter-spacing:-.02em;white-space:nowrap;">${kit.name}</span>` +
    `</div>` +
    `</div>`,
  )
  s.push(
    `<p><strong>The shape:</strong> ${kit.logos.variants[0]?.note ?? 'The primary mark — use this as the default in all contexts.'}</p>` +
    `<p><strong>The symbol:</strong> The mark and wordmark are used together in the primary configuration.</p>` +
    `<p><strong>The style:</strong> Always reproduce from approved files. Never recreate or alter proportions.</p>`,
  )

  // Variants — 2-column grid
  if (kit.logos.variants.length > 0) {
    s.push(`<h3>Secondary logo or variations</h3>`)
    const variantGrid = kit.logos.variants.map((v) => {
      const inner = v.src
        ? `<img src="${v.src}" style="max-width:70%;max-height:70%;object-fit:contain;" />`
        : `<span style="font-size:28px;font-weight:800;color:${v.bg && v.bg !== '#ffffff' && v.bg !== '#f2f2f2' ? '#fff' : '#111'};">${kit.logoText}</span>`
      return (
        `<div style="display:flex;flex-direction:column;gap:12px;">` +
        `<div style="background:${v.bg ?? '#f2f2f2'};border-radius:14px;aspect-ratio:4/3;display:flex;align-items:center;justify-content:center;overflow:hidden;padding:24px;">` +
        inner +
        `</div>` +
        `<div>` +
        `<p style="margin:0 0 4px;font-size:13px;line-height:1.6;color:#333;"><strong>The variation:</strong> ${v.name}${v.note ? ' — ' + v.note : ''}</p>` +
        `<p style="margin:0;font-size:13px;line-height:1.6;color:#333;"><strong>The use case:</strong> ${v.bg === '#ffffff' || v.bg === '#f2f2f2' || !v.bg ? 'Use on light backgrounds and print materials.' : 'Use on dark backgrounds and digital surfaces.'}</p>` +
        `</div>` +
        `</div>`
      )
    }).join('')
    s.push(`<div data-visual=""><div style="display:grid;grid-template-columns:repeat(2,1fr);gap:20px;margin:14px 0;">${variantGrid}</div></div>`)
  }

  if (kit.logos.donts.length > 0) {
    s.push(`<h3>Never do this</h3><ul>`)
    kit.logos.donts.forEach((d) => s.push(`<li>${d}</li>`))
    s.push(`</ul>`)
  }

  /* ── Photography & Imagery ── */
  s.push(`<h2>Photography &amp; Imagery</h2>`)
  if (kit.imagery.desc) s.push(`<p>${kit.imagery.desc}</p>`)
  if (kit.imagery.photographyStyle)
    s.push(`<p><strong>Photography style:</strong> ${kit.imagery.photographyStyle}</p>`)
  if (kit.imagery.backgroundTexture)
    s.push(`<p><strong>Background &amp; texture:</strong> ${kit.imagery.backgroundTexture}</p>`)
  if (kit.imagery.hierarchy)
    s.push(`<p><strong>Composition:</strong> ${kit.imagery.hierarchy}</p>`)
  if (kit.imagery.brandPatterns)
    s.push(`<p><strong>Brand patterns:</strong> ${kit.imagery.brandPatterns}</p>`)

  // Image asset thumbnails
  if (kit.imagery.assets?.length) {
    s.push(`<h3>Image Assets</h3>`)
    const thumbs = kit.imagery.assets.map((a) =>
      `<div>` +
      `<div style="background:${a.preview ?? '#ddd'};aspect-ratio:4/3;border-radius:8px;border:1px solid rgba(0,0,0,.06);-webkit-print-color-adjust:exact;print-color-adjust:exact;"></div>` +
      `<div style="font-size:11px;font-weight:600;color:#111;margin-top:5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${a.name}</div>` +
      `<div style="font-size:10px;color:#999;">${a.size}</div>` +
      `</div>`,
    ).join('')
    s.push(`<div data-visual=""><div style="${GRID(4)}">${thumbs}</div></div>`)
  }


  if (kit.imagery.dos.length > 0) {
    s.push(`<h3>Do</h3><ul>`)
    kit.imagery.dos.forEach((d) => s.push(`<li>${d}</li>`))
    s.push(`</ul>`)
  }
  if (kit.imagery.donts.length > 0) {
    s.push(`<h3>Don't</h3><ul>`)
    kit.imagery.donts.forEach((d) => s.push(`<li>${d}</li>`))
    s.push(`</ul>`)
  }
  if (!kit.imagery.desc && kit.imagery.dos.length === 0) s.push(ph('imagery data'))

  /* ── Voice & Tone ── */
  s.push(`<h2>Brand Voice &amp; Tone</h2>`)
  const { tone } = kit

  // Target audience
  const audienceParts: string[] = []
  if (tone.ageMin !== undefined && tone.ageMax !== undefined)
    audienceParts.push(`${tone.ageMin}–${tone.ageMax} year olds`)
  else if (tone.ageMin !== undefined) audienceParts.push(`${tone.ageMin}+`)
  if (tone.gender) audienceParts.push(tone.gender)
  if (tone.locations?.length) audienceParts.push(`based in ${tone.locations.join(', ')}`)
  if (audienceParts.length > 0) {
    s.push(`<h3>Target Audience</h3>`)
    s.push(`<p>We write for <strong>${audienceParts.join(', ')}</strong> — every word should feel relevant, direct, and worth their time.</p>`)
  }

  // Voice characteristics
  if (tone.attrs?.length) {
    s.push(`<h3>Voice Characteristics</h3>`)
    const attrStr = tone.attrs.map((a) => `<strong>${a.t}</strong> (not ${a.vs})`).join(', ')
    s.push(`<p>The ${kit.name} voice is ${attrStr}.</p>`)
    tone.attrs.forEach((a) => s.push(`<p>${a.d}</p>`))
  }

  // Tone spectrum axes
  if (tone.spectrum?.length) {
    s.push(`<h3>Tone Spectrum</h3>`)
    const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)
    const spectrumRows = tone.spectrum.map((axis) => {
      const stop = axis.stops[axis.value] ?? axis.stops[0]
      return `<strong>${capitalize(axis.id)}:</strong> ${stop.label} — <em>${stop.desc}</em>`
    })
    s.push(`<p>${spectrumRows.join('<br>')}</p>`)
    if (tone.spectrumExample)
      s.push(`<p>Tone example: <em>"${tone.spectrumExample}"</em></p>`)
  }

  // Writing style: language & text density
  const writingStyleParts: string[] = []
  if (tone.language) writingStyleParts.push(`Language: <strong>${tone.language}</strong>`)
  if (tone.textDensity) {
    const densityDesc = tone.textDensity === 'minimal'
      ? 'Short, punchy — every word must earn its place.'
      : tone.textDensity === 'concise'
        ? 'Clear and purposeful — enough context, no filler.'
        : 'Thorough and informative — depth over brevity.'
    writingStyleParts.push(`Text density: <strong>${tone.textDensity.charAt(0).toUpperCase() + tone.textDensity.slice(1)}</strong> — ${densityDesc}`)
  }
  if (writingStyleParts.length > 0) {
    s.push(`<h3>Writing Style</h3>`)
    writingStyleParts.forEach((line) => s.push(`<p>${line}</p>`))
  }

  // Language choices
  if (tone.use?.length || tone.avoid?.length) {
    s.push(`<h3>Language Choices</h3>`)
    if (tone.use?.length) s.push(`<p>Words we use: <em>${tone.use.join(', ')}</em></p>`)
    if (tone.avoid?.length) s.push(`<p>Words we avoid: <em>${tone.avoid.join(', ')}</em></p>`)
  }

  // Custom instruction
  if (tone.customInstruction) {
    s.push(`<h3>Additional Guidance</h3>`)
    s.push(`<p>${tone.customInstruction}</p>`)
  }

  // Examples
  if (tone.on) s.push(`<h3>On-brand example</h3><p>${tone.on}</p>`)
  if (tone.off) s.push(`<h3>Off-brand example</h3><p>${tone.off}</p>`)

  if (!tone.attrs?.length && !tone.use?.length && !tone.on && !tone.spectrum?.length)
    s.push(ph('voice and tone data'))

  /* Custom categories */
  const customCats = kit.categories.filter((c) => c.custom && c.rules?.length)
  if (customCats.length > 0) {
    customCats.forEach((cat) => {
      s.push(`<h2>${cat.label}</h2>`)
      ;(cat.rules ?? []).forEach((r) => {
        s.push(`<h3>${r.t}</h3><p>${r.d}</p>`)
      })
    })
  }

  return s.join('\n')
}

/* ── Toolbar button ──────────────────────────────────────────── */
function ToolBtn({
  active, onClick, title, children,
}: {
  active?: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`gl-tool-btn${active ? ' active' : ''}`}
    >
      {children}
    </button>
  )
}

/* ── Editor modal ────────────────────────────────────────────── */
function GuidelineEditorModal({
  kit, ed, onClose,
}: { kit: BrandKit; ed: EditorActions; onClose: () => void }) {
  const [disclaimerVisible, setDisclaimerVisible] = useState(true)
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      VisualBlock,
      TaglineBlock,
      TipTapImage.configure({ inline: false, allowBase64: true }),
    ],
    content: kit.guidelineDoc ?? '',
    autofocus: true,
  })

  const run = (fn: () => void) => { fn(); editor?.view.focus() }

  const handleDone = () => {
    if (editor) ed.setVal(['guidelineDoc'], editor.getHTML())
    onClose()
  }

  return (
    <Portal>
      <div className="scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
        <div className="modal gl-editor-modal">
          {/* Toolbar */}
          <div className="gl-toolbar">
            <div className="gl-tool-group">
              <ToolBtn
                title="Bold (Ctrl+B)" active={editor?.isActive('bold')}
                onClick={() => run(() => editor?.chain().focus().toggleBold().run())}
              >
                <strong>B</strong>
              </ToolBtn>
              <ToolBtn
                title="Italic (Ctrl+I)" active={editor?.isActive('italic')}
                onClick={() => run(() => editor?.chain().focus().toggleItalic().run())}
              >
                <em>I</em>
              </ToolBtn>
              <ToolBtn
                title="Underline (Ctrl+U)" active={editor?.isActive('underline')}
                onClick={() => run(() => editor?.chain().focus().toggleUnderline().run())}
              >
                <span style={{ textDecoration: 'underline' }}>U</span>
              </ToolBtn>
            </div>

            <div className="gl-tool-sep" />

            <div className="gl-tool-group">
              <ToolBtn
                title="Heading 1" active={editor?.isActive('heading', { level: 1 })}
                onClick={() => run(() => editor?.chain().focus().toggleHeading({ level: 1 }).run())}
              >
                H1
              </ToolBtn>
              <ToolBtn
                title="Heading 2" active={editor?.isActive('heading', { level: 2 })}
                onClick={() => run(() => editor?.chain().focus().toggleHeading({ level: 2 }).run())}
              >
                H2
              </ToolBtn>
              <ToolBtn
                title="Heading 3" active={editor?.isActive('heading', { level: 3 })}
                onClick={() => run(() => editor?.chain().focus().toggleHeading({ level: 3 }).run())}
              >
                H3
              </ToolBtn>
              <ToolBtn
                title="Normal text" active={editor?.isActive('paragraph')}
                onClick={() => run(() => editor?.chain().focus().setParagraph().run())}
              >
                ¶
              </ToolBtn>
            </div>

            <div className="gl-tool-sep" />

            <div className="gl-tool-group">
              <ToolBtn
                title="Bullet list" active={editor?.isActive('bulletList')}
                onClick={() => run(() => editor?.chain().focus().toggleBulletList().run())}
              >
                •≡
              </ToolBtn>
              <ToolBtn
                title="Numbered list" active={editor?.isActive('orderedList')}
                onClick={() => run(() => editor?.chain().focus().toggleOrderedList().run())}
              >
                1≡
              </ToolBtn>
            </div>

            <div className="gl-tool-sep" />

            <div className="gl-tool-group">
              <ToolBtn
                title="Undo (Ctrl+Z)"
                onClick={() => run(() => editor?.chain().focus().undo().run())}
              >
                <RotateCcw style={{ width: 13, height: 13 }} />
              </ToolBtn>
              <ToolBtn
                title="Redo (Ctrl+Y)"
                onClick={() => run(() => editor?.chain().focus().redo().run())}
              >
                <RotateCw style={{ width: 13, height: 13 }} />
              </ToolBtn>
            </div>

            <div className="gl-tool-sep" />

            <div className="gl-tool-group">
              <label className="gl-tool-btn" title="Upload image" style={{ cursor: 'pointer' }}>
                <ImageIcon style={{ width: 14, height: 14 }} />
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (!file || !editor) return
                    const reader = new FileReader()
                    reader.onload = () => {
                      editor.chain().focus().setImage({ src: reader.result as string }).run()
                    }
                    reader.readAsDataURL(file)
                    e.target.value = ''
                  }}
                />
              </label>
            </div>

            <div style={{ flex: 1 }} />

            <div className="gl-tool-group">
              <button type="button" className="btn sm secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="button" className="btn sm primary" onClick={handleDone}>
                <Check style={{ width: 13, height: 13 }} /> Done
              </button>
            </div>
          </div>

          {/* Disclaimer */}
          {disclaimerVisible && (
            <div className="gl-editor-disclaimer">
              <span>Edits made here only affect the brand guideline document and do not change your Brand Kit settings.</span>
              <button className="gl-disclaimer-close" onClick={() => setDisclaimerVisible(false)}>✕</button>
            </div>
          )}

          {/* Editor body */}
          <div className="gl-editor-body">
            <div className="gl-doc-sheet">
              <EditorContent editor={editor} className="gl-prosemirror" />
            </div>
          </div>
        </div>
      </div>
    </Portal>
  )
}

/* ── Main ────────────────────────────────────────────────────── */
export function Guideline({ kit, ed }: GuidelineProps) {
  const [editorOpen, setEditorOpen] = useState(false)
  const [generating, setGenerating] = useState(false)
  const hasDoc = Boolean(kit.guidelineDoc)

  const handleGenerate = () => {
    setGenerating(true)
    setTimeout(() => {
      ed.setVal(['guidelineDoc'], buildGuidelineHTML(kit))
      setGenerating(false)
    }, 1800)
  }

  const handleRegen = () => {
    if (confirm('Regenerate from current kit data? This will overwrite manual edits.')) {
      setGenerating(true)
      setTimeout(() => {
        ed.setVal(['guidelineDoc'], buildGuidelineHTML(kit))
        setGenerating(false)
      }, 1800)
    }
  }

  return (
    <div className="fade-in guideline-page">
      {/* Top bar */}
      <div className="doc-topbar">
        <div>
          <div className="doc-topbar-title">{kit.name} Brand Guidelines</div>
          <div className="doc-topbar-date">Last generated {kit.updated}</div>
        </div>
        <div className="doc-topbar-actions">
          {hasDoc && (
            <>
              <button className="btn secondary sm" onClick={handleRegen}>
                <RotateCcw style={{ width: 13, height: 13 }} /> Regenerate
              </button>
              <button className="btn secondary sm" onClick={() => setEditorOpen(true)}>
                <Pencil style={{ width: 13, height: 13 }} /> Edit
              </button>
              <button className="btn secondary sm" onClick={() => window.print()}>
                <Download style={{ width: 14, height: 14 }} /> Export PDF
              </button>
            </>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div className="doc-canvas">
        {generating ? (
          /* Loading state */
          <div className="guideline-empty">
            <div className="guideline-generating-spinner" />
            <h3 className="guideline-empty-title">Generating guideline…</h3>
            <p className="guideline-empty-desc">
              Compiling your brand kit into a complete document.
            </p>
          </div>
        ) : !hasDoc ? (
          /* Empty state */
          <div className="guideline-empty">
            <div className="guideline-empty-icon">
              <FileText style={{ width: 32, height: 32 }} />
            </div>
            <h3 className="guideline-empty-title">No guideline yet</h3>
            <p className="guideline-empty-desc">
              Generate a complete brand guideline document from your kit data.
              You can freely edit it afterwards.
            </p>
            <button className="btn primary" onClick={handleGenerate}>
              <FileText style={{ width: 14, height: 14 }} />
              Generate Guideline
            </button>
          </div>
        ) : (
          /* Preview */
          <div className="doc-page doc-prose" style={{ animation: 'fadeIn .4s ease' }}>
            <div
              className="gl-preview-content"
              dangerouslySetInnerHTML={{ __html: kit.guidelineDoc! }}
            />
          </div>
        )}
      </div>

      {editorOpen && (
        <GuidelineEditorModal
          kit={kit}
          ed={ed}
          onClose={() => setEditorOpen(false)}
        />
      )}
    </div>
  )
}
