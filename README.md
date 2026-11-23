# Reservably - Sistema de gestión de turnos

Reservably es una SPA (Single Page Application) para administrar los turnos de una barbería y estética. El frontend permite a clientes reservar, reprogramar y cancelar citas; al staff consultar sus servicios y agenda; y al dueño gestionar servicios, usuarios y asignaciones.

La aplicación usa React con Supabase como backend administrado: autenticación, PostgreSQL y acceso a datos se realizan directamente desde el navegador mediante el cliente público de Supabase. No existe un servidor Express ni una API REST propia en la implementación actual de esta carpeta.

## Estado funcional

### Cliente

- Registro e inicio de sesión con Supabase Auth.
- Visualización de próximos turnos e historial paginado.
- Reserva en tres pasos: servicio, profesional y fecha/hora.
- Reprogramación de turnos pendientes o confirmados.
- Cancelación de turnos pendientes, confirmados o con pago pendiente.
- Consulta de disponibilidad por intervalo de 30 minutos.
- Comentarios opcionales de hasta 500 caracteres al crear una reserva.
- Tema claro/oscuro persistente y tour guiado.

### Staff

- Consulta de los servicios activos asignados.
- Consulta de agenda propia.
- Filtros por todos los turnos, hoy, pendientes, completados y cancelados.
- Actualización manual de la agenda.
- Cambio de turnos a estado `completado`.

### Dueño / administrador

- Acceso a un panel principal.
- Activación y desactivación de servicios.
- Gestión de roles entre `cliente` y `staff`.
- Activación y desactivación de usuarios.
- Asignación y desasignación de servicios a profesionales.
- Vistas de agenda e ingresos.

> **Limitación actual:** las pantallas `/dueno/agenda` y `/dueno/ingresos` todavía usan datos mock locales definidos en `src/services/turnosMockStore.ts`. Los cambios realizados en esas vistas no se sincronizan con Supabase ni con los turnos reales.

## Tecnologías

| Capa | Tecnología |
| --- | --- |
| Frontend | React 18, TypeScript |
| Enrutamiento | React Router 7 |
| Estado de servidor | TanStack React Query 5 |
| Estilos | Tailwind CSS 3 |
| Iconos | Lucide React |
| Backend administrado | Supabase: Auth, PostgreSQL y PostgREST |
| Build | Vite 8 |
| Fechas y formatos | date-fns y utilidades propias |

## Arquitectura

```text
Navegador
  |
  +-- React Router -> rutas públicas y protegidas por rol
  +-- AuthContext -> sesión de Supabase y perfil de usuario
  +-- React Query -> caché y recarga de datos
  +-- Services -> consultas de servicios, staff y turnos
  |
  +-- Supabase Auth
  +-- PostgreSQL / PostgREST
```

Las responsabilidades están organizadas principalmente en:

- `src/pages`: vistas por rol y flujo de negocio.
- `src/router`: rutas públicas y protegidas.
- `src/middleware`: protección por sesión y autorización por rol.
- `src/context`: sesión, tema, toasts y tour.
- `src/services`: acceso a tablas y operaciones de Supabase.
- `src/types/database.ts`: tipos de las entidades principales.
- `sql`: instrucciones de datos semilla, promoción de usuarios y políticas RLS.

Las claves públicas de Supabase pueden incorporarse al frontend. Las operaciones sensibles deben quedar protegidas mediante RLS y políticas de PostgreSQL; la clave privada o `service_role` no debe incluirse en variables `VITE_*` ni en el repositorio.

## Roles y autorización

El perfil se consulta en la tabla `usuario` usando el `id` de la sesión de Supabase.

| Rol | Acceso |
| --- | --- |
| `cliente` | `/cliente`, reserva, reprogramación, cancelación e historial |
| `staff` | `/staff`, servicios asignados y agenda propia |
| `dueno` | `/dueno` y las secciones administrativas |
| `admin` | `/dueno`, como equivalente administrativo |

Las rutas protegidas verifican primero que exista una sesión y luego el rol permitido. Esta comprobación mejora la navegación, pero la autorización real debe implementarse y verificarse en Supabase con RLS.

## Modelo de datos esperado

La aplicación consulta las siguientes tablas:

- `usuario`: perfil, datos personales, rol y estado.
- `negocio`: datos comerciales, horarios generales, calendario laboral y políticas.
- `servicio`: nombre, categoría, precio, duración y estado activo.
- `staff`: vínculo entre usuario y negocio, comisión y estado.
- `staff_servicio`: relación entre profesionales y servicios habilitados.
- `horario_staff`: jornadas y franjas horarias por profesional y día.
- `turno`: reserva, intervalo, estado, precio, pago y fechas de cambio.
- `tour_usuario`: progreso del tour por usuario y rol.

Estados de turno utilizados por el frontend:

```text
pendiente
confirmado
pago_pendiente
completado
cancelado
no_show
```

## Reglas implementadas

### Disponibilidad

La función `getHorariosDisponibles` realiza las siguientes comprobaciones:

- Busca las franjas activas de `horario_staff` para el profesional y día seleccionado.
- Si el profesional no tiene horarios cargados, usa como respaldo `hora_apertura`, `hora_cierre` y `dias_laborables` de `negocio`.
- Genera bloques iniciando cada 30 minutos.
- Descarta bloques anteriores al momento actual.
- Exige que el intervalo completo del servicio pueda completarse dentro de la franja.
- Descarta turnos que se superpongan con el staff o con el cliente.
- Considera ocupados los estados `pendiente`, `confirmado` y `pago_pendiente`.
- Permite ignorar el turno que se está reprogramando.
- Reconsulta la disponibilidad antes de confirmar y si el horario fue ocupado, pide elegir otro.

El control de disponibilidad se hace desde el frontend; debe existir una restricción o función concurrente en PostgreSQL para evitar dos reservas simultáneas si se necesita garantía firme.

### Reservas y cancelaciones

- Una reserva se crea en estado `pendiente`.
- El inicio y el fin se calculan con la duración del servicio.
- El precio se copia del servicio al turno.
- Solo el cliente propietario puede reprogramar su turno.
- Solo pueden reprogramarse turnos `pendiente` o `confirmado` cuya fecha todavía no haya ocurrido.
- Cancelar cambia el estado a `cancelado` y registra `cancelado_en`.
- Staff puede marcar turnos como `completado`.

### Comisiones y no-shows

El modelo contiene campos para comisiones y políticas de no-show, pero la versión actual no ejecuta un cálculo de comisiones ni un bloqueo automático por reincidencia en `no_show`. Tampoco existe una interfaz para marcar un turno como no-show.

## Configuración local

### Requisitos

- Node.js 22.11 o superior, según `package.json`.
- npm.
- Un proyecto Supabase con las tablas descritas arriba.
- Claves públicas de ese proyecto.

### Variables de entorno

Crear `.env.local` en la raíz:

```dotenv
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_publica
VITE_NEGOCIO_ID=uuid-del-negocio
VITE_APP_NAME=El Estilo
VITE_APP_TIMEZONE=America/Argentina/Buenos_Aires
VITE_APP_TOUR_VERSION=1
```

Solo `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` y opcionalmente `VITE_NEGOCIO_ID` son necesarios para iniciar la aplicación actual. Las demás variables están tipadas o preparadas para configuración, pero `VITE_APP_NAME` y `VITE_APP_TIMEZONE` no se utilizan todavía.

`VITE_SUPABASE_ANON_KEY` es una clave pública destinada al cliente. Nunca colocar la clave `service_role` en `.env.local`.

### Instalación y ejecución

```bash
npm install
npm run dev
```

Vite inicia el sitio en `http://localhost:5173`.

### Scripts disponibles

```bash
npm run dev    # servidor de desarrollo
npm run build  # comprobación TypeScript y build de producción
npm run preview
npm run lint   # comprobación de TypeScript sin emitir
```

No hay suite de pruebas automatizada configurada en `package.json`.

### Estado conocido de compilación

Antes del build, la configuración actual debe corregir:

```text
tsconfig.json -> compilerOptions.ignoreDeprecations
```

El valor `6.0` no es válido para la versión TypeScript declarada en el proyecto (`^5.6.2`). Con esa configuración, `npm run build` falla en `tsc` antes de generar el bundle de Vite.

## Supabase

### Datos semilla

El archivo `sql/02-seed-base.sql` contiene ejemplos para crear un negocio y cuatro servicios. Antes de ejecutarlo hay que reemplazar:

- `PEGAR_UUID_DEL_DUENO` con el UUID de Auth del dueño.
- Los UUID y datos de negocio si se usa otro entorno.

Los scripts SQL no reemplazan una migración completa del esquema: asumen que las tablas, claves foráneas y políticas ya existen.

### Staff de demostración

`sql/03-promote-users.sql` muestra cómo promover un usuario registrado con `sofia@demo.com` a staff, asignarle servicios y cargar horario de lunes a viernes de 9:00 a 18:00.

Después del registro del usuario, hay que ejecutar sus consultas de actualización e inserción con el entorno correspondiente.

### Políticas RLS

`sql/04-patch-rls-relaciones.sql` agrega una política que permite ver el perfil de la contraparte en un turno:

- Un cliente puede consultar el perfil de su staff.
- Un staff puede consultar el perfil de su cliente.

Las políticas deben probarse con la misma sesión y el rol real de Supabase. Si no están configuradas para las demás tablas, las consultas del cliente, staff o dueño pueden fallar por RLS.

## Registro y carga de perfiles

El registro envía a Supabase Auth los metadatos `nombre`, `apellido`, `telefono`, `fecha_nacimiento`, `preferencias`, `foto_url`, `rol` y `estado`.

La aplicación luego carga el perfil desde `usuario` usando el UUID de sesión. Por eso el proyecto Supabase debe contar con un mecanismo que cree o sincronice la fila de `usuario` con cada usuario de Auth, por ejemplo un trigger o una política/función de alta controlada. Este repositorio incluye SQL de contenido y promoción, pero no incluye un esquema completo ni el trigger de creación de perfil.

## Estructura principal

```text
.
├── src/
│   ├── components/
│   │   ├── layout/
│   │   ├── tour/
│   │   └── ui/
│   ├── contexts/
│   ├── lib/
│   ├── middleware/
│   ├── pages/
│   │   ├── auth/
│   │   ├── cliente/
│   │   ├── dueno/
│   │   ├── landing/
│   │   └── staff/
│   ├── router/
│   ├── services/
│   └── types/
├── sql/
│   ├── 02-seed-base.sql
│   ├── 03-promote-users.sql
│   └── 04-patch-rls-relaciones.sql
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## Verificación manual recomendada

1. Iniciar sesión o registrar un usuario cliente.
2. Confirmar que exista su fila en `usuario`.
3. Crear o cargar servicios activos.
4. Configurar al menos un profesional y su relación `staff_servicio`.
5. Cargar horarios en `horario_staff` o configurar horarios generales del negocio.
6. Reservar un turno y verificar que no aparezca el horario ocupado.
7. Reprogramar y cancelar el turno como cliente.
8. Iniciar como staff y marcar el turno como completado.
9. Promover un usuario a dueño/staff según las necesidades del entorno.
10. Verificar con RLS las acciones permitidas y denegadas para cada rol.
