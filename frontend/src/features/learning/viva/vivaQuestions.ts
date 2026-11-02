export interface VivaQuestion {
  id: string
  topic: 'Minimax' | 'Alpha-Beta' | 'RPS Theory'
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  question: string
  modelAnswer: string
}

export const vivaQuestions: VivaQuestion[] = [
  {
    id: 'q1',
    topic: 'Minimax',
    difficulty: 'Beginner',
    question: 'What does a MAX node do in Minimax?',
    modelAnswer: "It picks the child with the highest value, representing the AI's own best move.",
  },
  {
    id: 'q2',
    topic: 'Alpha-Beta',
    difficulty: 'Intermediate',
    question: 'Why does ordering moves improve Alpha-Beta pruning but not Minimax correctness?',
    modelAnswer:
      'Move order never changes which value Minimax ultimately computes, so correctness is unaffected. But visiting strong moves first makes the α ≥ β pruning condition trigger earlier, pruning more nodes for the same final answer.',
  },
  {
    id: 'q3',
    topic: 'RPS Theory',
    difficulty: 'Advanced',
    question: 'Why is standard one-round Rock Paper Scissors not solved by alternating-turn Alpha-Beta?',
    modelAnswer:
      "Because it's a simultaneous-action game — neither player observes the other's choice before committing. Alpha-Beta assumes perfect information at each node, which doesn't apply here. The correct tool is a payoff matrix plus mixed-strategy (Nash) equilibrium analysis.",
  },
  {
    id: 'q4',
    topic: 'RPS Theory',
    difficulty: 'Intermediate',
    question: 'Why is (1/3, 1/3, 1/3) the Nash equilibrium for standard RPS?',
    modelAnswer:
      "The payoff matrix is unchanged under cyclic relabeling of the three choices, so any equilibrium must be too — forcing equal probability on all three. At that distribution every pure response yields expected value 0, so neither side can profit by deviating.",
  },
]
