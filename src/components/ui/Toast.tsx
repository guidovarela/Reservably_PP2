import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'info'
interface T { id: number; message: string; type: ToastType }
const Ctx = createContext<{ toast: (m: string, t?: ToastType) => void } | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<T[]>([])
  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000)
  }, [])
  const remove = (id: number) => setToasts((t) => t.filter((x) => x.id !== id))
  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[300] flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => (
          <div key={t.id} className={cn(
            'flex items-start gap-2 rounded-xl px-4 py-3 shadow-lg border text-sm',
            t.type === 'success' && 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100',
            t.type === 'error' && 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100',
            t.type === 'info' && 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'
          )}>
            {t.type === 'success' && <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />}
            {t.type === 'error' && <XCircle className="h-5 w-5 text-red-500 shrink-0" />}
            {t.type === 'info' && <Info className="h-5 w-5 text-brand-500 shrink-0" />}
            <p className="flex-1">{t.message}</p>
            <button onClick={() => remove(t.id)} className="opacity-50 hover:opacity-100"><X className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

export function useToast() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useToast dentro de ToastProvider')
  return ctx
}