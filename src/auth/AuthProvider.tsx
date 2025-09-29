'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Role = 'BasicUser'|'PremiumUser'
type Ctx = { user:any|null; role:Role|null; loading:boolean; signOut:()=>Promise<void> }
const AuthCtx = createContext<Ctx>({ user:null, role:null, loading:true, signOut:async()=>{} })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any|null>(null)
  const [role, setRole] = useState<Role|null>(null)
  const [loading, setLoading] = useState(true)
  async function loadRole(u:any|null){
    if(!u) return setRole(null)
    const { data } = await supabase.from('profiles').select('role').eq('userid', u.id).single()
    setRole((data?.role as Role) ?? null)
  }
  useEffect(() => {
    (async () => {
      const { data:{ session } } = await supabase.auth.getSession()
      const u = session?.user ?? null
      setUser(u); await loadRole(u); setLoading(false)
    })()
    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, s) => {
      const u = s?.user ?? null
      setUser(u); await loadRole(u)
    })
    return () => sub.subscription.unsubscribe()
  }, [])
  const signOut = async () => { await supabase.auth.signOut(); setUser(null); setRole(null) }
  return <AuthCtx.Provider value={{ user, role, loading, signOut }}>{children}</AuthCtx.Provider>
}
export const useAuth = () => useContext(AuthCtx)