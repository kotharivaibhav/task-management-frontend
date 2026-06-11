import { useEffect, type PropsWithChildren } from 'react'

type Props = PropsWithChildren<{
  open: boolean
  onClose: () => void
  title: string
  wide?: boolean
}>

export default function Modal({ open, onClose, title, wide, children }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        aria-label="Close modal"
        onClick={onClose}
      />
      <div
        className={`relative z-10 max-h-[90vh] w-full overflow-hidden rounded-2xl bg-white shadow-2xl ${
          wide ? 'max-w-3xl' : 'max-w-lg'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            ✕
          </button>
        </div>
        <div className="max-h-[calc(90vh-4rem)] overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
