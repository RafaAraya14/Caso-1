'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [role, setRole] = useState<string>('BasicUser')
  const [coach, setCoach] = useState<{ id: number|null, name?: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return router.replace('/login')

      const uid = session.user.id

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('userid', uid)
        .single()
      if (profile?.role) setRole(profile.role)

      const { data: coachRow } = await supabase
        .from('coaches')
        .select('id, displayname')
        .eq('userid', uid)
        .maybeSingle()

      setCoach(coachRow ? { id: coachRow.id, name: coachRow.displayname } : { id: null })
    }
    void init()
  }, [router])

  const logout = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  return (
    <main className="max-w-6xl mx-auto p-6">
      <header className="mb-6">
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-slate-400">Tu rol: <span className="text-brand-300">{role}</span></p>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        {/* KPI simple */}
        <div className="card p-5">
          <p className="text-sm text-slate-400">Estado</p>
          <h3 className="mt-1 text-2xl font-semibold">
            {coach?.id ? 'Coach activo' : 'Usuario'}
          </h3>
          {coach?.name && <p className="text-slate-400 mt-1">({coach.name})</p>}
        </div>

        <div className="card p-5">
          <p className="text-sm text-slate-400">Próximas 24h</p>
          <h3 className="mt-1 text-2xl font-semibold">Sesiones: —</h3>
          <p className="text-slate-400 mt-1 text-sm">Conecta el query real más adelante</p>
        </div>

        <div className="card p-5">
          <p className="text-sm text-slate-400">Créditos</p>
          <h3 className="mt-1 text-2xl font-semibold">—</h3>
          <p className="text-slate-400 mt-1 text-sm">userpackages pendiente</p>
        </div>
      </section>

      <div className="mt-8 flex justify-end">
        <button onClick={logout} className="btn btn-primary h-11">Cerrar sesión</button>
      </div>
    </main>
  )
}
