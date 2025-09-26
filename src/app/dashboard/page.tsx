// app/dashboard/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [role, setRole] = useState<string>('BasicUser')
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return router.replace('/login')

      // OJO: la columna en BD es "userid" (minúsculas)
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('userid', session.user.id)
        .single()

      if (error) {
        // si no hay fila, evita ruido en consola
        // puedes descomentar si querés ver detalles: console.warn('profiles error', error)
        return
      }
      if (data?.role) setRole(data.role)
    }
    void init()
  }, [router])

  const logout = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  return (
    <div style={{ display:'grid', gap:12 }}>
      <h1>Dashboard</h1>
      <p>Tu rol: {role}</p>
      <button onClick={logout}>Cerrar sesión</button>
    </div>
  )
}