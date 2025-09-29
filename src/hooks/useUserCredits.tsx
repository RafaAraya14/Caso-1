// src/hooks/useUserCredits.ts
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
export function useUserCredits(userId?: string|null){
  const [credits, setCredits] = useState<number|null>(null)
  useEffect(()=>{ if(!userId) return
    supabase.from('userpackages').select('creditsremaining')
    .eq('useridfk', userId).order('purchasedat', { ascending:false })
    .limit(1).maybeSingle().then(({data})=>setCredits(data?.creditsremaining ?? null))
  },[userId])
  return { credits }
}
