# Software de Nutrición

Plataforma de gestión para consultorios de nutrición deportiva y clínica: sitio público de cara al paciente y panel de administración completo para el profesional. Construido con Next.js 14 (App Router) y TypeScript.

## Contenido

- **Sitio público** — landing, servicios, sobre mí, blog, calculadora metabólica, turnero de reservas online, contacto.
- **Panel de administración** (`/admin`) — dashboard, gestión de pacientes (altas, edición, papelera/archivado), agenda de turnos, finanzas, y consola clínica por paciente (anamnesis, antropometría, plan alimentario con buscador de alimentos, evolución con gráficos, notas, exportación a PDF).

### Acceso al panel

El usuario administrador se define con variables de entorno (ver `.env.example`):

```
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=<una-clave-segura>
```

## Stack técnico

- **Framework:** Next.js 14 (App Router), React 18, TypeScript
- **Estilos:** Tailwind CSS v3 — sistema de diseño propio con tokens semánticos por CSS variables (modo claro/oscuro sin duplicar clases), tipografía Fraunces + Inter
- **Datos:** MongoDB / Mongoose (pacientes, consultas, notas, turnos) + PostgreSQL / Prisma (finanzas)
- **Auth:** NextAuth (credenciales)
- **Animaciones:** Framer Motion
- **Gráficos:** Recharts
- **Pagos:** Mercado Pago
- **Calendario:** Google Calendar API
- **PDF:** @react-pdf/renderer
- **PWA:** next-pwa

## Desarrollo local

```bash
npm install
npm run dev
```

La app queda disponible en `http://localhost:3005`.

### Variables de entorno

Creá un `.env.local` con:

```
MONGODB_URI=          # cadena de conexión MongoDB
DATABASE_URL=         # cadena de conexión PostgreSQL (Prisma)
NEXTAUTH_SECRET=      # generar con: openssl rand -hex 32
NEXTAUTH_URL=http://localhost:3005

# Opcionales según la funcionalidad que quieras probar
ADMIN_EMAIL=
ADMIN_PASSWORD=
MP_ACCESS_TOKEN=      # Mercado Pago
GOOGLE_CLIENT_EMAIL=  # Google Calendar
GOOGLE_PRIVATE_KEY=
GOOGLE_CALENDAR_ID=
USDA_API_KEY=         # búsqueda de alimentos USDA
```

## Build de producción

```bash
npm run build
npm start
```

## Deploy

Desplegado en [Vercel](https://vercel.com), con build y despliegue automático en cada push a `master`.

## Modo demo

Con `DEMO_MODE=1` (y `NEXT_PUBLIC_DEMO_MODE=1` para mostrar el aviso) la app funciona como una demo pública:

- El panel de administración se abre **sin contraseña**.
- Cada visitante recibe **su propio espacio de datos**, identificado por una cookie. Un cliente de Prisma con aislamiento agrega el filtro del espacio a todas las consultas, así que dos personas que editan al mismo tiempo no se ven entre sí (ni siquiera chocan al usar el mismo DNI o el mismo horario).
- Cada espacio nace con pacientes, consultas, finanzas, turnos y artículos de ejemplo, y se **borra solo a las 2 horas**. También hay un botón para restablecerlo.
- El pago de la reserva se simula: no se conecta a Mercado Pago.
- Si la conexión pasa por un pooler que ignora el esquema (como el de Neon), definí `DB_SCHEMA` con el nombre del esquema para las consultas SQL a mano.

Sin esas variables, la app se comporta como siempre, con login.
