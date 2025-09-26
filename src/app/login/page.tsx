'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) return setErr(error.message)
    router.push('/dashboard')
  }

  return (
    <main className="min-h-[calc(100vh-0.5rem)] grid place-items-center p-4">
      <div className="card w-full max-w-md p-6">
        <h1 className="text-3xl font-semibold mb-6">Iniciar sesión</h1>
        <form onSubmit={onSubmit} className="grid gap-4">
          <input
            className="input"
            type="email"
            placeholder="Correo"
            value={email}
            onChange={e=>setEmail(e.target.value)}
          />
          <input
            className="input"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e=>setPassword(e.target.value)}
          />
          {err && <p className="text-red-400 text-sm">{err}</p>}
          <button className="btn btn-primary h-11" disabled={loading} type="submit">
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </main>
  )
}
