import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import * as I from '@/shared/icons'
import type { ProductConfig } from '../config'

interface Props {
  config: ProductConfig
  userPrompt: string
  onBack: () => void
}

type Message =
  | { role: 'agent'; text: string; isFinal?: boolean }
  | { role: 'user'; text: string }
  | { role: 'typing' }

export function AgentChat({ config, userPrompt, onBack }: Props) {
  const navigate = useNavigate()
  const Icon = I.Icons[config.icon]
  const [messages, setMessages] = useState<Message[]>([])
  const [turnIndex, setTurnIndex] = useState(0)
  const [awaitingReply, setAwaitingReply] = useState(false)
  const [done, setDone] = useState(false)
  const [confirmed, setConfirmed] = useState<Record<string, string>>({})
  const [freeText, setFreeText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const startedRef = useRef(false)
  const script = config.agentScript

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    playNextAgentTurn(0)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function playNextAgentTurn(idx: number) {
    const turn = script[idx]
    if (!turn) return

    setMessages(prev => [...prev, { role: 'typing' }])
    setTimeout(() => {
      setMessages(prev => [
        ...prev.filter(m => m.role !== 'typing'),
        { role: 'agent', text: turn.message, isFinal: turn.isFinal },
      ])
      if (turn.isFinal) {
        setDone(true)
      } else {
        setAwaitingReply(true)
      }
    }, 900)
  }

  function handleReply(text: string, label?: string) {
    const displayText = label ?? text
    setAwaitingReply(false)
    setMessages(prev => [...prev, { role: 'user', text: displayText }])

    const questionShort = getQuestionKey(script[turnIndex]?.message ?? '')
    setConfirmed(prev => ({ ...prev, [questionShort]: displayText }))

    const next = turnIndex + 1
    setTurnIndex(next)
    setTimeout(() => playNextAgentTurn(next), 400)
  }

  function handleFreeSubmit() {
    if (!freeText.trim()) return
    handleReply(freeText.trim())
    setFreeText('')
  }

  const currentTurn = script[turnIndex]
  const showChips = awaitingReply && currentTurn?.chips && currentTurn.chips.length > 0
  const showInput = awaitingReply && (!currentTurn?.chips || currentTurn.chips.length === 0)

  return (
    <div className="ac-layout">
      {/* Left sidebar */}
      <aside className="ac-sidebar">
        <button className="ac-back" onClick={onBack}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back
        </button>

        <div className="ac-sidebar-product">
          <div className="ac-sidebar-icon" style={{ background: `${config.color}20`, color: config.color }}>
            {Icon && <Icon style={{ width: 18, height: 18 }} />}
          </div>
          <span className="ac-sidebar-label">{config.label}</span>
        </div>

        <div className="ac-sidebar-prompt">
          <span className="ac-sidebar-prompt-label">Your idea</span>
          <p className="ac-sidebar-prompt-text">"{userPrompt}"</p>
        </div>

        {Object.keys(confirmed).length > 0 && (
          <div className="ac-sidebar-confirmed">
            <span className="ac-sidebar-prompt-label">Confirmed</span>
            {Object.entries(confirmed).map(([k, v]) => (
              <div key={k} className="ac-confirmed-row">
                <span className="ac-confirmed-key">{k}</span>
                <span className="ac-confirmed-val">{v}</span>
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* Main chat */}
      <div className="ac-main">
        <div className="ac-topbar">
          <div className="ac-agent-info">
            <div className="ac-agent-avatar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a4 4 0 0 1 4 4 4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4z" />
              </svg>
            </div>
            <div>
              <span className="ac-agent-name">LayerProof AI</span>
              <span className="ac-agent-status">● Online</span>
            </div>
          </div>
        </div>

        <div className="ac-messages">
          {messages.map((msg, i) => {
            if (msg.role === 'typing') {
              return (
                <div key={i} className="ac-bubble ac-bubble--agent">
                  <div className="ac-typing-dots">
                    <span /><span /><span />
                  </div>
                </div>
              )
            }
            if (msg.role === 'agent') {
              return (
                <div key={i} className="ac-msg-row ac-msg-row--agent">
                  <div className="ac-agent-dot" style={{ background: config.color }} />
                  <div className="ac-bubble ac-bubble--agent">{msg.text}</div>
                </div>
              )
            }
            return (
              <div key={i} className="ac-msg-row ac-msg-row--user">
                <div className="ac-bubble ac-bubble--user" style={{ background: config.color }}>{msg.text}</div>
              </div>
            )
          })}

          {showChips && (
            <div className="ac-chips-row">
              {currentTurn!.chips!.map(chip => (
                <button key={chip} className="ac-chip" onClick={() => handleReply(chip)}
                  style={{ '--chip-color': config.color } as React.CSSProperties}>
                  {chip}
                </button>
              ))}
            </div>
          )}

          {showInput && (
            <div className="ac-free-row">
              <input
                className="ac-free-input"
                placeholder={currentTurn?.inputPlaceholder ?? 'Type your answer…'}
                value={freeText}
                autoFocus
                onChange={e => setFreeText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleFreeSubmit()}
              />
              <button className="ac-free-send" onClick={handleFreeSubmit} style={{ background: config.color }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          {done && (
            <div className="ac-open-wrap">
              <button
                className="ac-open-btn"
                style={{ background: config.color }}
                onClick={() => navigate(`/editor/${config.slug}`)}
              >
                Open Editor
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  )
}

function getQuestionKey(message: string): string {
  if (message.toLowerCase().includes('platform')) return 'Platform'
  if (message.toLowerCase().includes('tone')) return 'Tone'
  if (message.toLowerCase().includes('variation')) return 'Variations'
  if (message.toLowerCase().includes('type')) return 'Type'
  if (message.toLowerCase().includes('audience')) return 'Audience'
  if (message.toLowerCase().includes('brand')) return 'Branding'
  if (message.toLowerCase().includes('access')) return 'Access'
  if (message.toLowerCase().includes('organ')) return 'Organization'
  if (message.toLowerCase().includes('purpose') || message.toLowerCase().includes('goal')) return 'Goal'
  if (message.toLowerCase().includes('slides') || message.toLowerCase().includes('how many')) return 'Length'
  if (message.toLowerCase().includes('style') || message.toLowerCase().includes('visual')) return 'Style'
  if (message.toLowerCase().includes('format') || message.toLowerCase().includes('dimension')) return 'Format'
  if (message.toLowerCase().includes('device')) return 'Device'
  return 'Setting'
}
