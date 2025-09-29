// src/components/CoachActions.tsx
import { useAuth } from '../auth/AuthProvider'
export function CoachActions({ selectedCoachId }: { selectedCoachId: number }) {
  const { role, loading } = useAuth()
  if (loading) return null
  return (
    <div style={{display:'flex',gap:12}}>
      <button>Check availability</button>
      {role === 'PremiumUser' && <button>Hire coach</button>}
    </div>
  )
}