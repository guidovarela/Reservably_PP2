import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface TurnoMock {
  id: string;
  clienteNombre: string;
  clienteTelefono: string;
  servicioNombre: string;
  staffNombre: string;
  inicio: string;
  fin: string;
  estado: 'pendiente' | 'confirmado' | 'completado' | 'cancelado';
  precio: number;
}

const TURNOS_MOCK: TurnoMock[] = [
  {
    id: '1',
    clienteNombre: 'Guido Varela',
    clienteTelefono: '11 2222-3333',
    servicioNombre: 'Uñas esculpidas',
    staffNombre: 'Sofía',
    inicio: '2026-11-18 10:00',
    fin: '2026-11-18 11:30',
    estado: 'pendiente',
    precio: 15000,
  },
  {
    id: '2',
    clienteNombre: 'Carlos Cortez',
    clienteTelefono: '123456',
    servicioNombre: 'Maquillaje social',
    staffNombre: 'Sofía',
    inicio: '2026-11-18 14:00',
    fin: '2026-11-18 15:00',
    estado: 'confirmado',
    precio: 18000,
  },
  {
    id: '3',
    clienteNombre: 'Lucia',
    clienteTelefono: '1145550001',
    servicioNombre: 'Corte + barba',
    staffNombre: 'Sofía',
    inicio: '2026-11-17 16:00',
    fin: '2026-11-17 16:45',
    estado: 'completado',
    precio: 12000,
  },
];

export default function AgendaAdmin() {
  const [turnos, setTurnos] = useState<TurnoMock[]>(TURNOS_MOCK);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');

  const turnosFiltrados = turnos.filter(t => {
    if (filtroEstado === 'todos') return true;
    return t.estado === filtroEstado;
  });

  const cambiarEstado = (id: string, nuevoEstado: TurnoMock['estado']) => {
    setTurnos(prev =>
      prev.map(t => (t.id === id ? { ...t, estado: nuevoEstado } : t))
    );
  };

  const badgeColor = (estado: TurnoMock['estado']) => {
    switch (estado) {
      case 'pendiente': return 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-900/50';
      case 'confirmado': return 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-900/50';
      case 'completado': return 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50';
      case 'cancelado': return 'bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-400 border-rose-200 dark:border-rose-900/50';
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/dueno">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Volver al panel
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Administración de Agenda</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Gestiona y supervisa las citas del negocio.</p>
        </div>

        <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl text-sm font-medium">
          {['todos', 'pendiente', 'confirmado', 'completado'].map(est => (
            <button
              key={est}
              onClick={() => setFiltroEstado(est)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                filtroEstado === est 
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-xs' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {est}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        {turnosFiltrados.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 text-gray-500">
            No hay turnos para este estado.
          </div>
        ) : (
          turnosFiltrados.map(turno => (
            <div
              key={turno.id}
              className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors shadow-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">{turno.clienteNombre}</p>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeColor(turno.estado)}`}>
                    {turno.estado.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Servicio: <strong className="text-gray-800 dark:text-gray-200">{turno.servicioNombre}</strong> con <span className="text-blue-600 dark:text-blue-400 font-medium">{turno.staffNombre}</span>
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  📅 {turno.inicio}hs &nbsp;|&nbsp; Tel: {turno.clienteTelefono}
                </p>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-gray-100 dark:border-gray-800">
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">${turno.precio.toLocaleString()}</span>
                
                <div className="flex gap-2">
                  {turno.estado !== 'completado' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cambiarEstado(turno.id, 'completado')}
                    >
                      Completar
                    </Button>
                  )}
                  {turno.estado === 'pendiente' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => cambiarEstado(turno.id, 'confirmado')}
                    >
                      Confirmar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}