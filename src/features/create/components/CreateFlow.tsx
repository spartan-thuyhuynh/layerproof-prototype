import { useState } from 'react'
import type { ProductConfig } from '../config'
import { PromptScreen } from './PromptScreen'
import { AgentChat } from './AgentChat'

interface Props {
  config: ProductConfig
}

export function CreateFlow({ config }: Props) {
  const [stage, setStage] = useState<'prompt' | 'chat'>('prompt')
  const [userPrompt, setUserPrompt] = useState('')

  function handlePromptSubmit(prompt: string) {
    setUserPrompt(prompt)
    setStage('chat')
  }

  if (stage === 'chat') {
    return (
      <AgentChat
        config={config}
        userPrompt={userPrompt}
        onBack={() => setStage('prompt')}
      />
    )
  }

  return <PromptScreen config={config} onSubmit={handlePromptSubmit} />
}
