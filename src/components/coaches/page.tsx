'use client'
import { CoachActions } from '../../components/CoachActions' // 

export default function CoachesDemo() {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Coach #1</h2>
      <CoachActions selectedCoachId={1} />
    </div>
  )
}
