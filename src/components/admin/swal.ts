'use client'
/**
 * Sweet-alert style popups for the admin panel (no extra package).
 *   await askConfirm({ title, text })  → true / false
 *   notify('Saved!')                   → big popup with ✓, closes by itself
 *   toast('Status → Shipped')          → small corner message
 */

type Kind = 'success' | 'error' | 'warning' | 'info'
const COLORS: Record<Kind, string> = { success: '#16a34a', error: '#dc2626', warning: '#f59e0b', info: '#2563eb' }

let styled = false
function css() {
  if (styled || typeof document === 'undefined') return
  styled = true
  const s = document.createElement('style')
  s.textContent = `
.sw-bg{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:16px;background:rgba(15,17,21,.45);backdrop-filter:blur(3px);animation:sw-fade .18s ease-out}
.sw-bg.out{animation:sw-fadeout .16s ease-in forwards}
.sw-box{width:min(400px,100%);background:#fff;border-radius:22px;padding:28px 24px 22px;text-align:center;box-shadow:0 30px 80px rgba(0,0,0,.25);animation:sw-pop .32s cubic-bezier(.2,1.4,.4,1);font-family:inherit}
.sw-bg.out .sw-box{animation:sw-popout .16s ease-in forwards}
.sw-ic{width:76px;height:76px;margin:0 auto 14px;border-radius:50%;display:grid;place-items:center;border:4px solid currentColor}
.sw-ic svg{width:40px;height:40px}
.sw-ic .draw{stroke-dasharray:60;stroke-dashoffset:60;animation:sw-draw .45s .12s ease-out forwards}
.sw-t{font-size:20px;font-weight:700;color:#111;margin:0}
.sw-x{font-size:14px;color:#6b7280;margin:8px 0 0;line-height:1.55;white-space:pre-line}
.sw-btns{display:flex;gap:10px;justify-content:center;margin-top:22px}
.sw-btn{border:0;border-radius:999px;padding:11px 22px;font-weight:600;font-size:14px;cursor:pointer;transition:transform .1s,opacity .15s;font-family:inherit}
.sw-btn:active{transform:scale(.97)}
.sw-btn:focus{outline:none}
.sw-btn:focus-visible{box-shadow:0 0 0 4px rgba(0,0,0,.12)}
.sw-btn.c{background:#f1f2f4;color:#111}
.sw-btn.c:hover{background:#e5e7eb}
.sw-btn.ok{color:#fff}
.sw-btn.ok:hover{opacity:.9}
.sw-bar{height:3px;border-radius:3px;margin:18px auto 0;width:70%;background:#f1f2f4;overflow:hidden}
.sw-bar i{display:block;height:100%;animation:sw-bar linear forwards}
.sw-toasts{position:fixed;right:16px;bottom:16px;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none}
.sw-toast{display:flex;align-items:center;gap:10px;background:#111827;color:#fff;padding:11px 16px;border-radius:12px;font-size:14px;font-weight:600;box-shadow:0 12px 30px rgba(0,0,0,.25);animation:sw-slide .25s cubic-bezier(.2,1.3,.4,1)}
.sw-toast.out{animation:sw-fadeout .2s ease-in forwards}
.sw-toast b{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font-size:13px;flex:none}
@keyframes sw-fade{from{opacity:0}}@keyframes sw-fadeout{to{opacity:0}}
@keyframes sw-pop{from{transform:scale(.7);opacity:0}}@keyframes sw-popout{to{transform:scale(.85);opacity:0}}
@keyframes sw-draw{to{stroke-dashoffset:0}}@keyframes sw-bar{from{width:100%}to{width:0}}
@keyframes sw-slide{from{transform:translateY(20px);opacity:0}}
`
  document.head.appendChild(s)
}

const ICON: Record<Kind, string> = {
  success: '<path class="draw" d="M10 21l7 7 14-15" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>',
  error: '<path class="draw" d="M12 12l16 16M28 12L12 28" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>',
  warning: '<path class="draw" d="M20 9v14" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><circle cx="20" cy="30" r="2.6" fill="currentColor"/>',
  info: '<circle cx="20" cy="11" r="2.6" fill="currentColor"/><path class="draw" d="M20 17v14" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>',
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls: string, text?: string) {
  const e = document.createElement(tag)
  e.className = cls
  if (text != null) e.textContent = text // textContent = safe (no HTML injection)
  return e
}

function popup(o: { kind: Kind; title: string; text?: string; ok?: string; cancel?: string; okColor?: string; timer?: number }): Promise<boolean> {
  css()
  return new Promise((resolve) => {
    const bg = el('div', 'sw-bg')
    const box = el('div', 'sw-box')
    box.setAttribute('role', 'dialog')
    box.setAttribute('aria-modal', 'true')
    const ic = el('div', 'sw-ic')
    ic.style.color = COLORS[o.kind]
    ic.innerHTML = `<svg viewBox="0 0 40 40">${ICON[o.kind]}</svg>` // fixed icon markup only
    box.append(ic, el('h3', 'sw-t', o.title))
    if (o.text) box.append(el('p', 'sw-x', o.text))

    let done = false
    const close = (v: boolean) => {
      if (done) return
      done = true
      document.removeEventListener('keydown', onKey)
      bg.classList.add('out')
      setTimeout(() => bg.remove(), 170)
      resolve(v)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(false)
      if (e.key === 'Enter' && o.ok) close(true)
    }

    if (o.ok) {
      const row = el('div', 'sw-btns')
      if (o.cancel) {
        const c = el('button', 'sw-btn c', o.cancel)
        c.onclick = () => close(false)
        row.append(c)
      }
      const ok = el('button', 'sw-btn ok', o.ok)
      ok.style.background = o.okColor ?? COLORS[o.kind]
      ok.onclick = () => close(true)
      row.append(ok)
      box.append(row)
      setTimeout(() => ok.focus(), 50)
    }
    if (o.timer) {
      const bar = el('div', 'sw-bar')
      const i = el('i', '')
      i.style.background = COLORS[o.kind]
      i.style.animationDuration = `${o.timer}ms`
      bar.append(i)
      box.append(bar)
      setTimeout(() => close(true), o.timer)
    }
    bg.onclick = (e) => { if (e.target === bg) close(false) }
    document.addEventListener('keydown', onKey)
    bg.append(box)
    document.body.append(bg)
  })
}

/** "Sure?" popup. Resolves true if the user pressed the red button. */
export function askConfirm(o: { title: string; text?: string; confirmText?: string; cancelText?: string; danger?: boolean }) {
  return popup({ kind: o.danger === false ? 'info' : 'warning', title: o.title, text: o.text, ok: o.confirmText ?? 'Haan, delete koro', cancel: o.cancelText ?? 'Na, thak', okColor: o.danger === false ? COLORS.info : COLORS.error })
}

/** Big popup that closes by itself (success) or waits for OK (error). */
export function notify(title: string, opts: { text?: string; type?: Kind; timer?: number } = {}) {
  const kind = opts.type ?? 'success'
  return popup(kind === 'error' ? { kind, title, text: opts.text, ok: 'OK' } : { kind, title, text: opts.text, timer: opts.timer ?? 1400 })
}

/** Small corner message. */
export function toast(msg: string, type: Kind = 'success') {
  css()
  let wrap = document.querySelector<HTMLDivElement>('.sw-toasts')
  if (!wrap) { wrap = el('div', 'sw-toasts'); document.body.append(wrap) }
  const t = el('div', 'sw-toast')
  const b = el('b', '', type === 'success' ? '✓' : type === 'error' ? '✕' : '!')
  b.style.background = COLORS[type]
  t.append(b, el('span', '', msg))
  wrap.append(t)
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 220) }, 2200)
}
