const choices = ['Rock', 'Paper', 'Scissors'] as const

/** Payoffs from the row player's perspective. Matches docs/GAME_THEORY_DESIGN.md exactly. */
const matrix: Record<string, Record<string, number>> = {
  Rock: { Rock: 0, Paper: -1, Scissors: 1 },
  Paper: { Rock: 1, Paper: 0, Scissors: -1 },
  Scissors: { Rock: -1, Paper: 1, Scissors: 0 },
}

export function PayoffMatrixGrid() {
  return (
    <table className="w-full border-collapse text-center text-sm">
      <caption className="sr-only">Rock Paper Scissors zero-sum payoff matrix, row player's perspective</caption>
      <thead>
        <tr>
          <th scope="col" className="p-2 text-text-tertiary" />
          {choices.map((c) => (
            <th key={c} scope="col" className="p-2 text-xs font-medium text-text-tertiary">
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {choices.map((row) => (
          <tr key={row}>
            <th scope="row" className="p-2 text-xs font-medium text-text-tertiary">
              {row}
            </th>
            {choices.map((col) => {
              const value = matrix[row][col]
              return (
                <td
                  key={col}
                  title={`You play ${row}, opponent plays ${col} → ${
                    value > 0 ? 'you win' : value < 0 ? 'you lose' : 'tie'
                  } (${value > 0 ? '+1' : value})`}
                  className={`rounded-md border border-surface-card-border p-3 font-mono font-semibold ${
                    value > 0 ? 'text-state-success' : value < 0 ? 'text-state-error' : 'text-text-tertiary'
                  }`}
                >
                  {value > 0 ? `+${value}` : value}
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
