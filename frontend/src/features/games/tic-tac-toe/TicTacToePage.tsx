import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { SectionSubNav } from '@/components/navigation/SectionSubNav'
import { gameRoutes, labRoutes } from '@/lib/routes'
import { checkWinner, pickDemoAiMove, type Cell } from './ticTacToeDemo'

type Mode = 'human_vs_ai' | 'human_vs_human'

const EMPTY_BOARD: Cell[] = Array(9).fill(null)

export function TicTacToePage() {
  const route = gameRoutes[0]
  const [mode, setMode] = useState<Mode>('human_vs_ai')
  const [difficulty, setDifficulty] = useState('hard')
  const [board, setBoard] = useState<Cell[]>(EMPTY_BOARD)
  const [turn, setTurn] = useState<'X' | 'O'>('X')
  const [history, setHistory] = useState<string[]>([])
  const [score, setScore] = useState({ x: 0, o: 0, draws: 0 })
  const [aiThinking, setAiThinking] = useState(false)

  const { winner, line, isDraw } = checkWinner(board)
  const gameOver = Boolean(winner) || isDraw

  useEffect(() => {
    if (winner) {
      setScore((s) => ({ ...s, [winner.toLowerCase() as 'x' | 'o']: s[winner.toLowerCase() as 'x' | 'o'] + 1 }))
    } else if (isDraw) {
      setScore((s) => ({ ...s, draws: s.draws + 1 }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [winner, isDraw])

  useEffect(() => {
    if (mode !== 'human_vs_ai' || turn !== 'O' || gameOver) return
    setAiThinking(true)
    const timeout = window.setTimeout(() => {
      const move = pickDemoAiMove(board)
      if (move !== null) playMove(move, 'O')
      setAiThinking(false)
    }, 500)
    return () => window.clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, mode, gameOver])

  function playMove(index: number, player: 'X' | 'O') {
    setBoard((prev) => {
      if (prev[index] !== null) return prev
      const next = [...prev]
      next[index] = player
      return next
    })
    setHistory((prev) => [...prev, `${player} → cell ${index + 1}`])
    setTurn(player === 'X' ? 'O' : 'X')
  }

  function handleCellClick(index: number) {
    if (gameOver || board[index] !== null) return
    if (mode === 'human_vs_ai' && turn !== 'X') return
    playMove(index, turn)
  }

  function restart() {
    setBoard(EMPTY_BOARD)
    setTurn('X')
    setHistory([])
    setAiThinking(false)
  }

  return (
    <PageContainer
      route={route}
      actions={
        <Badge tone="warning">Demo opponent plays randomly — not Minimax or Alpha-Beta</Badge>
      }
    >
      <SectionSubNav items={gameRoutes} />

      <div className="mb-5 flex flex-wrap gap-3">
        <label className="flex items-center gap-2 text-sm text-text-secondary">
          Mode
          <select
            value={mode}
            onChange={(e) => {
              setMode(e.target.value as Mode)
              restart()
            }}
            className="rounded-md border border-surface-card-border bg-black/20 px-2 py-1.5 text-sm text-text-primary"
          >
            <option value="human_vs_ai">Human vs AI (demo)</option>
            <option value="human_vs_human">Human vs Human</option>
          </select>
        </label>
        {mode === 'human_vs_ai' && (
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            Difficulty
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="rounded-md border border-surface-card-border bg-black/20 px-2 py-1.5 text-sm text-text-primary"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </label>
        )}
      </div>
      {mode === 'human_vs_ai' && (
        <p className="mb-4 text-xs text-text-tertiary">
          Difficulty has no effect yet — the demo opponent always picks a random empty cell. Real
          difficulty levels arrive with the Minimax/Alpha-Beta engine in Phase 5–6.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col items-center gap-4">
          <div className="grid grid-cols-3 gap-2 rounded-lg border border-surface-card-border bg-surface-card p-3">
            {board.map((cell, i) => {
              const isWinningCell = line?.includes(i)
              return (
                <button
                  key={i}
                  onClick={() => handleCellClick(i)}
                  disabled={gameOver || cell !== null || (mode === 'human_vs_ai' && turn !== 'X')}
                  aria-label={`Cell ${i + 1} of 9, ${cell ? `occupied by ${cell}` : 'empty'}`}
                  className={`flex h-20 w-20 items-center justify-center rounded-md border text-3xl font-display font-bold transition-colors disabled:cursor-not-allowed sm:h-24 sm:w-24 ${
                    isWinningCell
                      ? 'border-accent-teal bg-accent-teal/15 text-accent-teal'
                      : 'border-surface-card-border bg-black/10 text-text-primary hover:border-accent-violet/40'
                  }`}
                >
                  {cell}
                </button>
              )
            })}
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={restart}>
              Restart
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <Card title="Turn & Status">
            {!gameOver ? (
              <p className="flex items-center gap-2 text-sm text-text-primary">
                <span className="h-2.5 w-2.5 rounded-full bg-accent-cyan" />
                {turn} to move
                {aiThinking && <span className="text-text-tertiary">· AI thinking…</span>}
              </p>
            ) : (
              <p className="text-sm font-medium text-text-primary">
                {winner ? `${winner} wins!` : "It's a draw."}
              </p>
            )}
          </Card>

          <Card title="Scoreboard">
            <div className="flex justify-between text-sm text-text-secondary">
              <span>X: {score.x}</span>
              <span>O: {score.o}</span>
              <span>Draws: {score.draws}</span>
            </div>
          </Card>

          <Card title="Move History">
            {history.length === 0 ? (
              <p className="text-sm text-text-tertiary">No moves yet.</p>
            ) : (
              <ol className="max-h-40 space-y-1 overflow-y-auto text-sm text-text-secondary">
                {history.map((h, i) => (
                  <li key={i}>
                    {i + 1}. {h}
                  </li>
                ))}
              </ol>
            )}
          </Card>

          <Card title="Analyze this position">
            <div className="flex flex-col gap-2">
              <Link to={labRoutes[0].path} className="text-sm text-accent-cyan hover:underline">
                Open in Minimax Explorer →
              </Link>
              <Link to={labRoutes[2].path} className="text-sm text-accent-cyan hover:underline">
                Compare Minimax vs Alpha-Beta →
              </Link>
            </div>
            <p className="mt-2 text-xs text-text-tertiary">
              These labs currently show illustrative example trees, not this specific board — real
              position analysis arrives once the search engine ships.
            </p>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}
