// app/login/page.tsx
'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const router = useRouter()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return setErr(error.message)
    router.push('/dashboard')
  }

  return (
    <form onSubmit={onSubmit} style={{ display:'grid', gap:12, maxWidth:320 }}>
      <h2>Iniciar sesión</h2>
      <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Contraseña" />
      {err && <small style={{ color:'tomato' }}>{err}</small>}
      <button type="submit">Entrar</button>
    </form>
  )
}
