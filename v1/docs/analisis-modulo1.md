# Módulo I: Análisis y Diseño - Reservably (Sistema de Barbería)

## 1. Taxonomía del Conocimiento
- **Datos:** Los registros de turnos (fecha, hora, barbero, cliente).
- **Información:** "El barbero Juan tiene 3 turnos agendados para el martes".
- **Conocimiento (Decisión):** "El barbero Juan está sobrecargado los martes. Se recomienda habilitar otro barbero en esa franja horaria".

## 2. Reglas de Negocio (Lógica del Sistema)
- **RN-01 (Superposición):** Un barbero no puede tener dos turnos en el mismo horario (ya implementado en PostgreSQL).
- **RN-02 (Disponibilidad):** Un turno debe estar dentro de la jornada laboral del barbero (Pendiente implementación).
- **RN-03 (No-show):** Un cliente con más de 3 inasistencias en 90 días queda bloqueado (Pendiente implementación).
- **RN-04 (Comisiones):** La comisión se calcula sobre turnos concretados.

## 3. Flujograma de Reserva (Lógica de Decisión)
flowchart TD
    A[Cliente solicita turno] --> B{¿Cliente bloqueado por no-show?}
    B -- Sí --> C[Rechazar reserva]
    B -- No --> D{¿Barbero disponible en ese horario?}
    D -- No --> E[Mostrar horarios alternativos]
    D -- Sí --> F[Crear turno en Base de Datos]
    F --> G[Notificar al cliente]
## 4. Historias de Usuario
HU-01: Como cliente, quiero reservar un turno para asegurar mi atención.

HU-02: Como administrador, quiero ver las comisiones de los barberos para liquidar sueldos.

HU-03: Como barbero, quiero marcar un no-show para liberar mi agenda.

## 5. Arquitectura y Principios SOLID
El proyecto implementa una Arquitectura en Capas (Routes -> Controllers -> Services -> Repositories), lo cual aplica el Principio de Responsabilidad Única (SRP) de SOLID, separando la lógica HTTP de la lógica de negocio y el acceso a datos.

