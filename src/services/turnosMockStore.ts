export interface TurnoMock {
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

let turnosData: TurnoMock[] = [
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

export const getTurnosMock = () => [...turnosData];

export const updateTurnoEstadoMock = (id: string, nuevoEstado: TurnoMock['estado']) => {
  turnosData = turnosData.map(t => (t.id === id ? { ...t, estado: nuevoEstado } : t));
  return [...turnosData];
};