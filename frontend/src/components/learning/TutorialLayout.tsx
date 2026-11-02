import type { ReactNode } from 'react'
import { Check } from 'lucide-react'

export interface Lesson {
  id: string
  title: string
}

interface TutorialLayoutProps {
  lessons: Lesson[]
  activeId: string
  completedIds: Set<string>
  onSelect: (id: string) => void
  children: ReactNode
}

export function TutorialLayout({ lessons, activeId, completedIds, onSelect, children }: TutorialLayoutProps) {
  const activeIndex = lessons.findIndex((l) => l.id === activeId)
  const progressPct = Math.round((completedIds.size / lessons.length) * 100)

  return (
    <div>
      <div className="mb-5">
        <div className="mb-1 flex justify-between text-xs text-text-secondary">
          <span>Progress</span>
          <span>
            {completedIds.size}/{lessons.length} lessons
          </span>
        </div>
        <div className="h-1.5 w-full rounded-pill bg-white/10">
          <div className="h-full rounded-pill bg-accent-teal transition-all" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Mobile: horizontal swipeable stepper */}
      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar lg:hidden">
        {lessons.map((lesson, i) => (
          <button
            key={lesson.id}
            onClick={() => onSelect(lesson.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-pill border px-3 py-1.5 text-xs whitespace-nowrap ${
              lesson.id === activeId
                ? 'border-accent-magenta/40 bg-accent-magenta/15 text-accent-magenta'
                : 'border-surface-card-border text-text-secondary'
            }`}
          >
            {completedIds.has(lesson.id) && <Check size={12} className="text-state-success" />}
            {i + 1}. {lesson.title}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <nav aria-label="Lessons" className="hidden lg:block">
          <ol className="space-y-1">
            {lessons.map((lesson, i) => (
              <li key={lesson.id}>
                <button
                  onClick={() => onSelect(lesson.id)}
                  aria-current={lesson.id === activeId ? 'step' : undefined}
                  className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm ${
                    lesson.id === activeId
                      ? 'bg-accent-violet/15 font-medium text-accent-violet'
                      : 'text-text-secondary hover:bg-white/5'
                  }`}
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-surface-card-border text-[10px]">
                    {completedIds.has(lesson.id) ? <Check size={12} className="text-state-success" /> : i + 1}
                  </span>
                  {lesson.title}
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <div>{children}</div>
      </div>

      <div className="mt-6 flex justify-between">
        <button
          disabled={activeIndex <= 0}
          onClick={() => onSelect(lessons[activeIndex - 1].id)}
          className="text-sm text-text-secondary hover:text-text-primary disabled:opacity-30"
        >
          ← Previous
        </button>
        <button
          disabled={activeIndex >= lessons.length - 1}
          onClick={() => onSelect(lessons[activeIndex + 1].id)}
          className="text-sm text-text-secondary hover:text-text-primary disabled:opacity-30"
        >
          Next →
        </button>
      </div>
    </div>
  )
}
