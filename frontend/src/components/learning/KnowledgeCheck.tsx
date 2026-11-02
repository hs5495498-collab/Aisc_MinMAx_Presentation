import { useState } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface KnowledgeCheckProps {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
  onCorrect?: () => void
}

export function KnowledgeCheck({ question, options, correctIndex, explanation, onCorrect }: KnowledgeCheckProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const isCorrect = submitted && selected === correctIndex

  function check() {
    setSubmitted(true)
    if (selected === correctIndex) onCorrect?.()
  }

  return (
    <div className="rounded-lg border border-surface-card-border bg-black/10 p-4">
      <p className="mb-3 text-sm font-medium text-text-primary">{question}</p>
      <div className="mb-3 space-y-2">
        {options.map((opt, i) => (
          <label key={opt} className="flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="radio"
              name={question}
              checked={selected === i}
              onChange={() => {
                setSelected(i)
                setSubmitted(false)
              }}
            />
            {opt}
          </label>
        ))}
      </div>
      {!submitted ? (
        <Button variant="secondary" onClick={check} disabled={selected === null}>
          Check Answer
        </Button>
      ) : (
        <div
          className={`flex items-start gap-2 rounded-md p-3 text-sm ${
            isCorrect ? 'bg-state-success/10 text-state-success' : 'bg-state-error/10 text-state-error'
          }`}
        >
          {isCorrect ? <CheckCircle2 size={18} className="shrink-0" /> : <XCircle size={18} className="shrink-0" />}
          <span>
            {isCorrect ? 'Correct! ' : 'Not quite. '}
            {explanation}
          </span>
        </div>
      )}
    </div>
  )
}
