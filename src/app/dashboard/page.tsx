
'use client'
import { useAuth } from '../../auth/AuthProvider'
import { useUserCredits } from '../../hooks/useUserCredits'
export default function DashboardPage(){
  const { user, role, loading } = useAuth()
  const { credits } = useUserCredits(user?.id)
  if (loading) return null
  return (
    <main className="p-6">
      <p>Rol: {role ?? '—'}</p>
      <p>Créditos: {credits ?? '—'}</p>
    </main>
  )
}