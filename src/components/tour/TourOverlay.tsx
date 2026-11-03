import { useEffect, useState } from 'react'
import { useTour } from '@/contexts/TourContext'

export function TourOverlay() {
  const { active, steps, currentStep, next, prev, skip } = useTour()
  const [rect, setRect] = useState<DOMRect | null>(null)
  const step = steps[currentStep]

  useEffect(() => {
    if (!active || !step) return
    const el = document.querySelector(step.target)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setRect(el.getBoundingClientRect())
    const fn = () => setRect(el.getBoundingClientRect())
    window.addEventListener('scroll', fn, true)
    window.addEventListener('resize', fn)
    return () => { window.removeEventListener('scroll', fn, true); window.removeEventListener('resize', fn) }
  }, [active, step])

  if (!active || !step) return null

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none">
      <div className="absolute inset-0 bg-black/50 pointer-events-auto" onClick={skip} />
      {rect && (
        <div
          className="absolute rounded-xl border-2 border-brand-500 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] pointer-events-none"
          style={{ top: rect.top - 8, left: rect.left - 8, width: rect.width + 16, height: rect.height + 16 }}
        />
      )}
      <div
        className="absolute pointer-events-auto w-72 rounded-2xl bg-white dark:bg-gray-900 p-5 shadow-2xl border border-gray-200 dark:border-gray-800"
        style={{
          top: rect ? Math.min(rect.bottom + 16, window.innerHeight - 240) : '50%',
          left: rect ? Math.max(16, Math.min(rect.left, window.innerWidth - 300)) : '50%',
        }}
      >
        <p className="text-xs font-semibold text-brand-500 mb-1">Paso {currentStep + 1} de {steps.length}</p>
        <h3 className="text-lg font-bold mb-1">{step.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{step.description}</p>
        <div className="flex justify-between items-center">
          <button onClick={skip} className="text-sm text-gray-500 hover:underline">Saltar</button>
          <div className="flex gap-2">
            <button onClick={prev} disabled={currentStep === 0} className="text-sm px-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30">Anterior</button>
            <button onClick={next} className="text-sm px-4 py-1.5 rounded-full bg-brand-500 text-white hover:bg-brand-600">
              {currentStep === steps.length - 1 ? 'Listo' : 'Siguiente'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}