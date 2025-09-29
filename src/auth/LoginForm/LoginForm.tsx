'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null); setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setErr(error.message)
    setLoading(false)
  }

  return (
    <form onSubmit={onSubmit} style={{display:'grid',gap:10,maxWidth:320}}>
      <h3>Iniciar sesión</h3>
      <input type="email" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input type="password" placeholder="contraseña" value={password} onChange={e=>setPassword(e.target.value)} />
      <button type="submit" disabled={loading}>{loading?'Ingresando…':'Entrar'}</button>
      {err && <small style={{color:'crimson'}}>{err}</small>}
    </form>
  )
}
