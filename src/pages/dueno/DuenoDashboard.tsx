import { Link } from 'react-router-dom'
import { Calendar, DollarSign, Package, Users } from 'lucide-react'

export default function DuenoDashboard() {
  const cards = [
    { to: '/dueno/servicios', icon: Package, label: 'Servicios', desc: 'Precios y duraciones' },
    { to: '/dueno/servicios', icon: Users, label: 'Equipo', desc: 'Staff y comisiones' },
    { to: '/dueno/servicios', icon: Calendar, label: 'Agenda', desc: 'Todos los turnos' },
    { to: '/dueno/servicios', icon: DollarSign, label: 'Reportes', desc: 'Ingresos y comisiones' },
  ]
  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Panel del dueño</h1>
      <p className="text-gray-500 mb-8">Administrá tu negocio</p>
      <div id="panel-servicios" className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 hover:shadow-md hover:border-brand-500 transition-all">
            <c.icon className="h-8 w-8 text-brand-500 mb-3" />
            <p className="font-semibold">{c.label}</p>
            <p className="text-sm text-gray-500">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}