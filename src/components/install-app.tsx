'use client'
import { useEffect, useState } from 'react'
import { CheckCircle2, Download, X } from 'lucide-react'

type BIP = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }

export function InstallApp({ variant = 'footer' }: { variant?: 'footer' | 'nav' }) {
  const [evt, setEvt] = useState<BIP | null>(null)
  const [device, setDevice] = useState<'ios' | 'android' | 'desktop'>('desktop')
  const [installed, setInstalled] = useState(false)
  const [help, setHelp] = useState(false)

  useEffect(() => {
    const on = (e: Event) => { e.preventDefault(); setEvt(e as BIP) }
    const done = () => { setInstalled(true); setEvt(null) }
    window.addEventListener('beforeinstallprompt', on)
    window.addEventListener('appinstalled', done)
    const ua = navigator.userAgent
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDevice(/iphone|ipad|ipod/i.test(ua) ? 'ios' : /android/i.test(ua) ? 'android' : 'desktop')
    setInstalled(window.matchMedia('(display-mode: standalone)').matches)
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {})
    return () => { window.removeEventListener('beforeinstallprompt', on); window.removeEventListener('appinstalled', done) }
  }, [])

  const click = async () => {
    if (evt) {
      await evt.prompt()
      const r = await evt.userChoice
      if (r.outcome === 'accepted') setInstalled(true)
      setEvt(null)
    } else setHelp(true)
  }

  if (variant === 'footer' && installed) return null

  const label = installed ? 'App installed' : 'Download App'
  const Icon = installed ? CheckCircle2 : Download

  return (
    <>
      {variant === 'nav' ? (
        <>
          <button onClick={click} disabled={installed} className="mb-1 hidden w-full items-center gap-2.5 rounded-xl bg-[#ff5a1f] px-3 py-2.5 text-sm font-semibold text-white disabled:bg-white/10 disabled:text-green-400 md:flex">
            <Icon size={17} /> {label}
          </button>
          {!installed && (
            <button onClick={click} className="fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-full bg-[#ff5a1f] px-4 py-3 text-sm font-semibold text-white shadow-lg md:hidden">
              <Download size={17} /> Download App
            </button>
          )}
        </>
      ) : (
        <button onClick={click} className="btn-dark mt-3 px-4 py-2"><Download size={17} /> Download App</button>
      )}

      {help && (
        <div className="fixed inset-0 z-[60] grid place-items-end bg-black/50 p-4 sm:place-items-center" onClick={() => setHelp(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 text-ink" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between"><b className="text-lg">App install korun</b><button onClick={() => setHelp(false)}><X size={18} /></button></div>
            {device === 'ios' && (
              <ol className="list-decimal space-y-2 pl-5 text-sm">
                <li><b>Safari</b> te ei page kholun (Chrome e hobe na)</li>
                <li>Niche <b>Share</b> button chapun (⬆️ square)</li>
                <li><b>Add to Home Screen</b> → <b>Add</b></li>
              </ol>
            )}
            {device === 'android' && (
              <ol className="list-decimal space-y-2 pl-5 text-sm">
                <li><b>Chrome</b> e ei page kholun</li>
                <li>Upore dan pashe <b>⋮</b> menu chapun</li>
                <li><b>Install app</b> ba <b>Add to Home screen</b> → <b>Install</b></li>
              </ol>
            )}
            {device === 'desktop' && (
              <ol className="list-decimal space-y-2 pl-5 text-sm">
                <li><b>Chrome</b> ba <b>Edge</b> e ei page kholun</li>
                <li>Address bar er dan pashe <b>install icon</b> chapun</li>
                <li>Na dekhale <b>⋮ → Cast, save and share → Install page as app</b></li>
              </ol>
            )}
            <p className="mt-3 text-xs text-neutral-500">Install er por home screen e alada app icon ashbe.</p>
          </div>
        </div>
      )}
    </>
  )
}