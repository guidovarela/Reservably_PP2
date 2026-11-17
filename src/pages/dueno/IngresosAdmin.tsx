import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, DollarSign, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getTurnosMock, TurnoMock } from '@/services/turnosMockStore';

export default function IngresosAdmin() {
  const [turnosCompletados, setTurnosCompletados] = useState<TurnoMock[]>([]);

  useEffect(() => {
    const todos = getTurnosMock();
    setTurnosCompletados(todos.filter(t => t.estado === 'completado'));
  }, []);

  const totalFacturado = turnosCompletados.reduce((acc, turno) => acc + turno.precio, 0);

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
          <h1 className="text-3xl font-bold">Control de Ingresos</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Detalle de servicios concluidos y total facturado.
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/70 dark:bg-emerald-950/30 px-5 py-3 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-400">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
              Total Facturado
            </p>
            <p className="text-2xl font-bold text-emerald-950 dark:text-emerald-100">
              ${totalFacturado.toLocaleString('es-AR')}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        {turnosCompletados.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 text-gray-500">
            Aún no hay turnos concluidos para contabilizar ingresos.
          </div>
        ) : (
          turnosCompletados.map(turno => (
            <div
              key={turno.id}
              className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors shadow-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                    {turno.servicioNombre}
                  </p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Cliente: <strong className="text-gray-800 dark:text-gray-200">{turno.clienteNombre}</strong> &nbsp;•&nbsp; Atendido por:{' '}
                  <span className="text-blue-600 dark:text-blue-400 font-medium">{turno.staffNombre}</span>
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  📅 Fecha: {turno.inicio}hs
                </p>
              </div>

              <div className="flex items-center justify-between w-full md:w-auto md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-gray-100 dark:border-gray-800">
                <span className="text-xs text-gray-400 md:hidden">Arancel:</span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  +${turno.precio.toLocaleString('es-AR')}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {turnosCompletados.length > 0 && (
        <div className="mt-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 p-5 flex justify-between items-center">
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              Total acumulado ({turnosCompletados.length} {turnosCompletados.length === 1 ? 'servicio' : 'servicios'})
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Suma de todos los turnos marcados como completados
            </p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            ${totalFacturado.toLocaleString('es-AR')}
          </p>
        </div>
      )}
    </div>
  );
}