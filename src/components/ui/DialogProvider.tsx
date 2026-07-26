import React, { createContext, useCallback, useContext, useState } from 'react'
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'

type DialogOptions = { title?: string; message: string; confirmLabel?: string; cancelLabel?: string; tone?: 'info' | 'danger' | 'success' }
type DialogState = DialogOptions & { kind: 'alert' | 'confirm'; resolve: (value: boolean) => void }
type DialogApi = { alert: (message: string, options?: Omit<DialogOptions, 'message'>) => Promise<void>; confirm: (message: string, options?: Omit<DialogOptions, 'message'>) => Promise<boolean> }
const DialogContext = createContext<DialogApi | null>(null)

export function useDialog() {
  const value = useContext(DialogContext)
  if (!value) throw new Error('useDialog must be used inside DialogProvider')
  return value
}

export default function DialogProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<DialogState | null>(null)
  const open = useCallback((kind: DialogState['kind'], message: string, options: Omit<DialogOptions, 'message'> = {}) => new Promise<boolean>(resolve => setDialog({ kind, message, resolve, ...options })), [])
  const close = (result: boolean) => { dialog?.resolve(result); setDialog(null) }
  const api: DialogApi = { alert: (message, options) => open('alert', message, options).then(() => undefined), confirm: (message, options) => open('confirm', message, options) }
  const tone = dialog?.tone || (dialog?.kind === 'confirm' ? 'info' : 'danger')
  const Icon = tone === 'danger' ? AlertTriangle : tone === 'success' ? CheckCircle2 : Info
  return <DialogContext.Provider value={api}>{children}{dialog && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" onKeyDown={event => { if (event.key === 'Escape') close(false) }}><div className="dialog-scroll w-full max-w-5xl max-h-[min(42rem,calc(100dvh-3rem))] overflow-y-auto rounded-2xl border border-hairline bg-surface p-6 shadow-2xl"><div className="flex items-start gap-3"><div className={`rounded-xl p-2 ${tone === 'danger' ? 'bg-rose-500/15 text-rose-400' : tone === 'success' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-cyan/15 text-cyan'}`}><Icon size={20} /></div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><h2 className="text-base font-semibold text-ink">{dialog.title || (dialog.kind === 'confirm' ? 'Please confirm' : 'Notice')}</h2><button onClick={() => close(false)} className="rounded-lg p-1 text-stone hover:bg-surface-soft hover:text-ink"><X size={16} /></button></div><p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-steel">{dialog.message}</p></div></div><div className="mt-6 flex justify-end gap-2">{dialog.kind === 'confirm' && <button onClick={() => close(false)} className="rounded-lg border border-hairline px-4 py-2 text-sm font-medium text-steel hover:bg-surface-soft">{dialog.cancelLabel || 'Cancel'}</button>}<button autoFocus onClick={() => close(true)} className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${tone === 'danger' ? 'bg-rose-600 hover:bg-rose-500' : tone === 'success' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-cyan-600 hover:bg-cyan-500'}`}>{dialog.kind === 'confirm' ? dialog.confirmLabel || 'Confirm' : dialog.confirmLabel || 'OK'}</button></div></div></div>}</DialogContext.Provider>
}
