import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <Compass size={40} className="text-text-tertiary" />
      <h1 className="font-display text-2xl font-bold text-text-primary">Page not found</h1>
      <p className="max-w-sm text-sm text-text-secondary">
        That route doesn't exist in Competitive AI Game Lab. Head back to the dashboard.
      </p>
      <Link to="/dashboard">
        <Button>Go to Dashboard</Button>
      </Link>
    </div>
  )
}
