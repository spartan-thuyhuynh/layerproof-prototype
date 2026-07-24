import { createElement } from 'react'
import type React from 'react'
import type { CSSProperties, SVGProps } from 'react'

interface IconProps extends SVGProps<SVGSVGElement> {
  className?: string
  style?: CSSProperties
}

const SF = (paths: Array<string | { t: string; p: Record<string, unknown> }>) =>
  ({ className, style, ...rest }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className} style={style} {...rest}>
      {paths.map((d, i) =>
        typeof d === 'string'
          ? <path key={i} d={d} />
          : createElement(d.t, { key: i, ...d.p })
      )}
    </svg>
  )

const S = (paths: Array<string | { t: string; p: Record<string, unknown> }>, extra: Partial<IconProps> = {}) =>
  ({ className, style, ...rest }: IconProps) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      {...extra}
      {...rest}
    >
      {paths.map((d, i) =>
        typeof d === 'string'
          ? <path key={i} d={d} />
          : createElement(d.t, { key: i, ...d.p })
      )}
    </svg>
  )

export const Home = S(['m3 10 9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M9 22V12h6v10'])
export const Folder = S(['M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z'])
export const Present = S([{ t: 'rect', p: { x: 3, y: 4, width: 18, height: 14, rx: 2 } }, 'M12 18v3', 'M8 21h8'])
export const Social = S([{ t: 'rect', p: { x: 7, y: 3, width: 10, height: 18, rx: 2 } }, 'M11 18h2'])
export const Docs = S(['M14 3v4a1 1 0 0 0 1 1h4', 'M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z', 'M9 13h6', 'M9 17h4'])
export const Sparkle = S(['M12 3v4M12 17v4M3 12h4M17 12h4', 'm6.3 6.3 2.4 2.4M15.3 15.3l2.4 2.4M17.7 6.3l-2.4 2.4M8.7 15.3l-2.4 2.4'])
export const Calendar = S([{ t: 'rect', p: { x: 3, y: 4, width: 18, height: 18, rx: 2 } }, 'M16 2v4M8 2v4M3 10h18'])
export const Library = S(["m12 3 2.5 5 5.5.8-4 4 .9 5.5L12 21l-4.9 2.6.9-5.5-4-4L9.5 8z"])
export const Settings = S([{ t: 'circle', p: { cx: 12, cy: 12, r: 3 } }, 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-2.82 1.17V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 7 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 2.6 14H2.5a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 8.4l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 5.4h.09A1.65 1.65 0 0 0 11 3.6V3.5a2 2 0 0 1 4 0v.09A1.65 1.65 0 0 0 17 5.4a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 21.4 11h.1a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z'])
export const Palette = S([{ t: 'circle', p: { cx: 13.5, cy: 6.5, r: '.5', fill: 'currentColor' } }, { t: 'circle', p: { cx: 17.5, cy: 10.5, r: '.5', fill: 'currentColor' } }, { t: 'circle', p: { cx: 8.5, cy: 7.5, r: '.5', fill: 'currentColor' } }, { t: 'circle', p: { cx: 6.5, cy: 12.5, r: '.5', fill: 'currentColor' } }, 'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.5-.7 1.5-1.5 0-.4-.2-.8-.4-1-.3-.3-.4-.6-.4-1 0-.8.7-1.5 1.5-1.5H16c3.3 0 6-2.7 6-6 0-5-4.5-9-10-9Z'])
export const Layers = S(['m12 2 9 5-9 5-9-5z', 'm3 12 9 5 9-5', 'm3 17 9 5 9-5'])
export const Type = S(['M4 7V5h16v2', 'M9 19h6', 'M12 5v14'])
export const Image = S([{ t: 'rect', p: { x: 3, y: 3, width: 18, height: 18, rx: 2 } }, { t: 'circle', p: { cx: 9, cy: 9, r: 1.5 } }, 'm21 15-4.5-4.5L7 20'])
export const Mic = S([{ t: 'rect', p: { x: 9, y: 2, width: 6, height: 12, rx: 3 } }, 'M5 10a7 7 0 0 0 14 0', 'M12 17v4'])
export const Grid = S([{ t: 'rect', p: { x: 3, y: 3, width: 7, height: 7, rx: 1 } }, { t: 'rect', p: { x: 14, y: 3, width: 7, height: 7, rx: 1 } }, { t: 'rect', p: { x: 14, y: 14, width: 7, height: 7, rx: 1 } }, { t: 'rect', p: { x: 3, y: 14, width: 7, height: 7, rx: 1 } }])
export const Lock = S([{ t: 'rect', p: { x: 4, y: 11, width: 16, height: 10, rx: 2 } }, 'M8 11V7a4 4 0 0 1 8 0v4'])
export const Unlock = S([{ t: 'rect', p: { x: 4, y: 11, width: 16, height: 10, rx: 2 } }, 'M8 11V7a4 4 0 0 1 7.5-2'])
export const Shield = S(['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z'])
export const Check = S(['M20 6 9 17l-5-5'])
export const CheckCircle = S(['M22 11.1V12a10 10 0 1 1-5.9-9.1', 'm22 4-10 10.1-3-3'])
export const X = S(['M18 6 6 18M6 6l12 12'])
export const Plus = S(['M12 5v14M5 12h14'])
export const ArrowLeft = S(['m12 19-7-7 7-7', 'M19 12H5'])
export const ArrowRight = S(['M5 12h14', 'm12 5 7 7-7 7'])
export const Chevron = S(['m6 9 6 6 6-6'])
export const Clock = S([{ t: 'circle', p: { cx: 12, cy: 12, r: 9 } }, 'M12 7v5l3 2'])
export const Bell = S(['M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9', 'M10.3 21a1.94 1.94 0 0 0 3.4 0'])
export const Download = S(['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'M7 10l5 5 5-5', 'M12 15V3'])
export const Upload = S(['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'M17 8l-5-5-5 5', 'M12 3v12'])
export const File = S(['M14 3v4a1 1 0 0 0 1 1h4', 'M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z'])
export const Eye = S(['M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z', { t: 'circle', p: { cx: 12, cy: 12, r: 3 } }])
export const EyeOff = S(['M9.9 4.2A9.5 9.5 0 0 1 12 4c6.5 0 10 7 10 7a13.2 13.2 0 0 1-2.4 3', 'M6.1 6.1C3.5 7.7 2 11 2 11s3.5 7 10 7a9.3 9.3 0 0 0 4-1', 'M3 3l18 18', 'M9.5 9.6a3 3 0 0 0 4.2 4.2'])
export const Trash = S(['M3 6h18', 'M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2', 'M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6', 'M10 11v6M14 11v6'])
export const Zap = S(['M13 2 3 14h9l-1 8 10-12h-9z'])
export const Ruler = S(['M21.3 8.7 8.7 21.3a1 1 0 0 1-1.4 0l-4.6-4.6a1 1 0 0 1 0-1.4L15.3 2.7a1 1 0 0 1 1.4 0l4.6 4.6a1 1 0 0 1 0 1.4Z', 'M7.5 10.5l2 2M11 7l1.5 1.5M14.5 3.5l2 2'])
export const Copy = S([{ t: 'rect', p: { x: 9, y: 9, width: 12, height: 12, rx: 2 } }, 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1'])
export const Info = S([{ t: 'circle', p: { cx: 12, cy: 12, r: 9 } }, 'M12 16v-4M12 8h.01'])
export const Wand = S(["m15 4 1 1M9 11 2 18l4 4 7-7", 'm14 7 3 3', 'M5 6h.01M19 13h.01M12 3h.01M19 19h.01'])
export const Globe = S([{ t: 'circle', p: { cx: 12, cy: 12, r: 9 } }, 'M2 12h20', 'M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18'])
export const Dot = S([{ t: 'circle', p: { cx: 12, cy: 12, r: 4, fill: 'currentColor', stroke: 'none' } }])
export const Star = S(['M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 18l-6.2 3 1.2-6.8L2 9.3l6.9-1z'])
export const ChevronUp = S(['m18 15-6-6-6 6'])
export const ChevronDown = S(['m6 9 6 6 6-6'])
export const Pencil = S(['M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z'])
export const MessageSquare = S(['M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'])
export const RotateCcw = S(['M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8', 'M3 3v5h5'])
export const RotateCw = S(['M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8', 'M21 3v5h-5'])
export const FileText = S(['M14 3v4a1 1 0 0 0 1 1h4', 'M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z', 'M9 9h1', 'M9 13h6', 'M9 17h6'])
export const Search = S([{ t: 'circle', p: { cx: 11, cy: 11, r: 8 } }, 'M21 21l-4.35-4.35'])
export const Sort = S(['M3 6h18', 'M7 12h10', 'M11 18h4'])
export const List = S(['M8 6h13', 'M8 12h13', 'M8 18h13', 'M3 6h.01', 'M3 12h.01', 'M3 18h.01'])
export const MoreHoriz = S([{ t: 'circle', p: { cx: 5, cy: 12, r: 1, fill: 'currentColor', stroke: 'none' } }, { t: 'circle', p: { cx: 12, cy: 12, r: 1, fill: 'currentColor', stroke: 'none' } }, { t: 'circle', p: { cx: 19, cy: 12, r: 1, fill: 'currentColor', stroke: 'none' } }])
export const Motion = S([{ t: 'circle', p: { cx: 12, cy: 12, r: 9 } }, 'M2 12h20', 'M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18'])

// Fill variants
export const SocialFill   = SF(['M7 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H7zm4 17h2a1 1 0 1 1 0 2h-2a1 1 0 1 1 0-2z'])
export const PresentFill  = SF(['M3 4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7v2H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-2v-2h7a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H3z'])
export const DocsFill     = SF(['M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-6zm-1 1.5L17.5 8H13V3.5zM9 13h6a1 1 0 1 1 0 2H9a1 1 0 1 1 0-2zm0 4h4a1 1 0 1 1 0 2H9a1 1 0 1 1 0-2z'])
export const LayersFill   = SF(['M12 2 2.5 7.5 12 13l9.5-5.5L12 2zM2.5 12 12 17.5 21.5 12l-1.8-1L12 15.3 4.3 11 2.5 12zM2.5 16.5 12 22l9.5-5.5-1.8-1L12 19.8l-7.7-4.3-1.8 1z'])
export const DesignFill   = SF(['M12 2a10 10 0 1 0 0 20c.9 0 1.5-.7 1.5-1.5 0-.4-.1-.7-.4-1-.2-.3-.4-.6-.4-1 0-.8.7-1.5 1.5-1.5H16c3.3 0 6-2.7 6-6C22 6.5 17.5 2 12 2zm-5.5 11a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3-4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z'])
export const MotionFill   = SF(['M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 2c.55 0 1.3.8 1.94 2.5H10.06C10.7 4.8 11.45 4 12 4zm-2.3.4A11.6 11.6 0 0 0 8.1 8H5.1A8.05 8.05 0 0 1 9.7 4.4zm4.6 0A8.05 8.05 0 0 1 18.9 8h-3A11.6 11.6 0 0 0 14.3 4.4zM4.5 10h3.1c-.1.65-.1 1.32-.1 2s0 1.35.1 2H4.5a7.94 7.94 0 0 1 0-4zm5.1 0h4.8c.1.64.1 1.31.1 2s0 1.36-.1 2H9.6A14.4 14.4 0 0 1 9.5 12c0-.69 0-1.36.1-2zm6.9 0h3.1a7.94 7.94 0 0 1 0 4h-3.1c.1-.65.1-1.32.1-2s0-1.35-.1-2zM5.1 16h3a11.6 11.6 0 0 0 1.6 3.6A8.05 8.05 0 0 1 5.1 16zm4.96 0h3.88C13.3 17.8 12.55 20 12 20c-.55 0-1.3-2.2-1.94-4zm5.04 0h3a8.05 8.05 0 0 1-4.6 3.6A11.6 11.6 0 0 0 15.1 16z'])
export const ZapFill      = SF(['M13 2 3 14h9l-1 8 10-12h-9z'])
export const StarFill     = SF(['m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 18l-6.2 3 1.2-6.8L2 9.3l6.9-1z'])

export const Icons: Record<string, (props: IconProps) => React.ReactElement> = {
  Home, Folder, Present, Social, Docs, Sparkle, Calendar, Library, Settings,
  SocialFill, PresentFill, DocsFill, LayersFill, DesignFill, MotionFill, ZapFill, StarFill,
  Palette, Layers, Type, Image, Mic, Grid, Lock, Unlock, Shield, Check, CheckCircle,
  X, Plus, ArrowLeft, ArrowRight, Chevron, ChevronUp, ChevronDown, Clock, Bell, Download, File,
  Eye, EyeOff, Trash, Zap, Ruler, Copy, Info, Wand, Globe, Dot, Star, Pencil, MessageSquare,
  Search, Sort, List, MoreHoriz, Motion,
}
