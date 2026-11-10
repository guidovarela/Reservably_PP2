import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Star } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getServiciosLanding } from '@/services/servicioService'

export default function LandingPage() {
  const { data: servicios = [], isLoading } = useQuery({
    queryKey: ['servicios-landing'],
    queryFn: getServiciosLanding,
  })

  return (
    <div>
      <section id="hero-booking" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-white dark:from-brand-950/30 dark:via-gray-950 dark:to-gray-950" />
        <div className="container mx-auto max-w-6xl px-4 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center relative">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 px-3 py-1 text-sm font-medium">
              <Sparkles className="h-4 w-4" /> Reservá en 30 segundos
            </span>
            <h1 className="mt-6 text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
              Tu estilo,<br /><span className="text-brand-500">tu momento.</span>
            </h1>
            <p className="mt-5 text-lg text-gray-600 dark:text-gray-400 max-w-md">
              Reservá turnos en barbería y estética sin llamar. Elegí profesional, horario y listo.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="inline-flex items-center justify-center rounded-full bg-brand-500 text-white px-6 py-3 font-medium hover:bg-brand-600">
                Reservar ahora <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link to="/login" className="inline-flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-6 py-3 font-medium hover:bg-gray-200 dark:hover:bg-gray-700">
                Ya tengo cuenta
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-2 text-sm text-gray-500">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}
              <span className="ml-1">4.9 · 320 reseñas</span>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-3xl bg-gradient-to-br from-brand-200 to-brand-400 dark:from-brand-800 dark:to-brand-600 shadow-2xl" />
          </div>
        </div>
      </section>

      <section id="servicios-lista" className="container mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold mb-2">Servicios populares</h2>
        <p className="text-gray-500 mb-8">Elegí lo que necesitás y reservá</p>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 animate-pulse h-48" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {servicios.map((s) => (
              <div key={s.id} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:shadow-md transition-shadow">
                <div className="aspect-video rounded-xl bg-gray-100 dark:bg-gray-800 mb-4" />
                <p className="text-xs uppercase tracking-wide text-brand-500 font-semibold">{s.categoria || 'Barbería'}</p>
                <h3 className="mt-1 font-semibold">{s.nombre}</h3>
                <div className="mt-2 flex justify-between items-center text-sm">
                  <span className="text-gray-500">{s.duracion_minutos} min</span>
                  <span className="font-bold">${Number(s.precio).toLocaleString('es-AR')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}