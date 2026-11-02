export type Cell = 'X' | 'O' | null

const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

export function checkWinner(board: Cell[]): { winner: 'X' | 'O' | null; line: number[] | null; isDraw: boolean } {
  for (const line of LINES) {
    const [a, b, c] = line
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line, isDraw: false }
    }
  }
  const isDraw = board.every((cell) => cell !== null)
  return { winner: null, line: null, isDraw }
}

/**
 * Temporary demo opponent: picks a uniformly random empty cell.
 * This is NOT Minimax or Alpha-Beta — real search-based AI arrives in
 * Phase 5–6. Never present this choice as strategically intelligent.
 */
export function pickDemoAiMove(board: Cell[]): number | null {
  const empty = board.reduce<number[]>((acc, cell, i) => {
    if (cell === null) acc.push(i)
    return acc
  }, [])
  if (empty.length === 0) return null
  return empty[Math.floor(Math.random() * empty.length)]
}
