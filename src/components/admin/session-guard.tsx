'use client'
import { useEffect, useRef } from 'react'
import { signOut, touchSession } from '@/app/actions/auth'

const KEY = 'tredo-admin-last-activity'
// full page load on purpose: wipes any admin data held in memory
const hardGo = (u: string) => window.location.replace(u)

/**
 * Comfort layer on top of the server timer:
 * - real activity (click/type/touch/scroll) keeps the server session alive (max once per 2 min)
 * - when idle time is over → logs out right away (all tabs), instead of waiting for the next click
 * Security does NOT depend on this — the server refuses expired sessions anyway.
 */
export function SessionGuard({ idleMs }: { idleMs: number }) {
  const lastTouch = useRef(0)
  useEffect(() => {
    const mark = () => {
      const now = Date.now()
      try { localStorage.setItem(KEY, String(now)) } catch {}
      if (now - lastTouch.current > 120_000) {
        lastTouch.current = now
        touchSession().then((ok) => { if (!ok) hardGo('/login?expired=1') }).catch(() => {})
      }
    }
    const last = () => { try { return Number(localStorage.getItem(KEY)) || Date.now() } catch { return Date.now() } }
    try { localStorage.setItem(KEY, String(Date.now())) } catch {}
    lastTouch.current = Date.now()
    const ev = ['pointerdown', 'keydown', 'touchstart', 'wheel'] as const
    ev.forEach((e) => window.addEventListener(e, mark, { passive: true }))
    const check = () => { if (Date.now() - last() > idleMs) signOut().catch(() => { hardGo('/login?expired=1') }) }
    const t = setInterval(check, 30_000)
    document.addEventListener('visibilitychange', check)
    // logout in one tab → every tab leaves
    const onStorage = (e: StorageEvent) => { if (e.key === 'tredo-admin-logout') hardGo('/login?out=1') }
    window.addEventListener('storage', onStorage)
    // page shown from back/forward cache → re-check with the server
    const onShow = (e: PageTransitionEvent) => { if (e.persisted) window.location.reload() }
    window.addEventListener('pageshow', onShow)
    return () => {
      ev.forEach((e) => window.removeEventListener(e, mark))
      clearInterval(t)
      document.removeEventListener('visibilitychange', check)
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('pageshow', onShow)
    }
  }, [idleMs])
  return null
}
