import { useState } from 'react'
import type { ProductConfig } from '../config'
import type { ThemeOption } from '../themes'
import { PromptScreen } from './PromptScreen'
import { AgentChat } from './AgentChat'

interface Props {
  config: ProductConfig
}

export function CreateFlow({ config }: Props) {
  const [stage, setStage] = useState<'prompt' | 'chat'>('prompt')
  const [userPrompt, setUserPrompt] = useState('')
  const [selectedTheme, setSelectedTheme] = useState<ThemeOption | null>(null)
  const [selectedTone, setSelectedTone] = useState<string | null>(null)
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])

  function handlePromptSubmit(prompt: string, theme: ThemeOption | null, tone: string | null, files: File[]) {
    setUserPrompt(prompt)
    setSelectedTheme(theme)
    setSelectedTone(tone)
    setAttachedFiles(files)
    setStage('chat')
  }

  if (stage === 'chat') {
    return (
      <AgentChat
        config={config}
        userPrompt={userPrompt}
        onBack={() => setStage('prompt')}
        initialTheme={selectedTheme}
        initialTone={selectedTone}
        attachedFiles={attachedFiles}
      />
    )
  }

  return <PromptScreen config={config} onSubmit={handlePromptSubmit} />
}
