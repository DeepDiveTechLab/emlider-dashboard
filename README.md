# Dashboard de Entregables — Colegio Emlider
## Sistema de gestión de proyectos audiovisuales · INNOVACIÓN TECNOLÓGICA

---

## Estructura del proyecto

```
emlider-dashboard/
├── app/
│   ├── globals.css          # Variables CSS y estilos base
│   ├── layout.tsx           # Root layout con fuentes
│   ├── page.tsx             # Redirige a /login o /dashboard
│   ├── login/
│   │   └── page.tsx         # Pantalla de login / registro
│   └── dashboard/
│       ├── layout.tsx       # Layout con sidebar (server, verifica auth)
│       ├── page.tsx         # Panel general con estadísticas
│       └── [slug]/
│           └── page.tsx     # Vista de proyecto individual
├── components/
│   ├── DashboardClient.tsx  # Sidebar + topbar (client component)
│   └── ProjectViewer.tsx    # Tabs + iframe + panel de revisión
├── lib/
│   ├── supabase.ts          # Cliente browser
│   ├── supabase-server.ts   # Cliente servidor (SSR)
│   └── types.ts             # TypeScript types
├── middleware.ts            # Protección de rutas
├── .env.local               # Variables de entorno ← YA CONFIGURADAS
└── package.json
```

---

## Instalación y despliegue

### Opción A — Vercel (recomendado, 5 minutos)

1. **Sube el código a GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   gh repo create emlider-dashboard --public --push
   ```

2. **Importa en Vercel:**
   - Entra a [vercel.com](https://vercel.com) → "Add New Project"
   - Selecciona tu repositorio
   - En **Environment Variables**, agrega:
     ```
     NEXT_PUBLIC_SUPABASE_URL = https://wgswgbpzphzmtaojwguj.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indnc3dnYnB6cGh6bXRhb2p3Z3VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3NTg0ODcsImV4cCI6MjA5NzMzNDQ4N30.s_2fgwCG2inx7pbHSahKgd2wtiQzO7vzo5nYpemw0w0
     ```
   - Haz clic en **Deploy**

3. **Configura la URL de redirect en Supabase:**
   - Ve a supabase.com → tu proyecto → Authentication → URL Configuration
   - Agrega tu URL de Vercel en "Redirect URLs":
     `https://tu-proyecto.vercel.app/**`

### Opción B — Local

```bash
cd emlider-dashboard
npm install
npm run dev
# Abre http://localhost:3000
```

---

## Primer uso

### Acceso restringido a 3 cuentas

El sistema **solo permite el acceso** a estos 3 correos (ya configurados en el código, en `lib/types.ts`):

| Correo | Rol | Acceso |
|--------|-----|--------|
| `computacion@emlider.edu.mx` | **admin** | Todo + pestaña **Work Hub** (carga documentos, revisa proyectos, edita progreso, lee comentarios) |
| `coordinacion@emlider.edu.mx` | coordinación | Solo lectura + pestaña **Comentarios** (envía mensajes a Computación) |
| `direccion@emlider.edu.mx` | dirección | Solo lectura + pestaña **Comentarios** |

### Primer login de cada cuenta

La primera vez que cada correo inicia sesión con una contraseña nueva, el sistema crea automáticamente la cuenta (vía Supabase Auth) y le asigna el rol correspondiente. Solo necesitas:

1. Abrir el dashboard
2. Escribir el correo institucional exacto (ej. `computacion@emlider.edu.mx`)
3. Elegir una contraseña (mínimo 6 caracteres) — esa será la contraseña permanente de esa cuenta
4. Hacer clic en "Ingresar" — el sistema la crea si no existe

Si tu proyecto de Supabase tiene activada la confirmación por correo, revisa la bandeja de entrada de esa cuenta institucional antes de volver a intentar el login.

### Panel docente / administrativo (Computación)
- Panel de revisión lateral en cada proyecto (estado + observaciones)
- Pestaña **Progreso**: control deslizante para % de preproducción / producción / postproducción
- Pestaña **Work Hub**: carga de documentos internos + bandeja de comentarios recibidos de Coordinación y Dirección

### Panel de solo lectura (Coordinación / Dirección)
- Ven los 10 proyectos, todas las pestañas, sin poder editar nada
- Pestaña **Comentarios** en vez de Work Hub: para enviar mensajes/observaciones a Computación


---

## Supabase

- **Proyecto:** colegio-emlider-entregables
- **ID:** wgswgbpzphzmtaojwguj
- **Región:** us-east-1 (Virginia)
- **URL:** https://wgswgbpzphzmtaojwguj.supabase.co

### Tablas
| Tabla | Contenido |
|-------|-----------|
| `profiles` | Usuarios con nombre y rol |
| `projects` | 10 proyectos con metadatos (incluye El Lorax, pendiente de contenido) |
| `project_documents` | 18 guiones cargados (literario + técnico × 9) |
| `project_reviews` | Estado de revisión por proyecto |
| `shooting_schedule` | Fecha y hora de rodaje por proyecto |
| `project_progress` | % de avance por fase (preprod/prod/postprod) |
| `work_hub_items` | Documentos internos cargados por Computación |
| `comments` | Mensajes de Coordinación/Dirección hacia Computación |

---

## Notas técnicas

- **Next.js 14** con App Router y Server Components
- **Supabase SSR** con cookies para autenticación
- **Sin dependencias de UI externas** — CSS-in-JS con estilos inline
- **RLS activo** en todas las tablas
- Documentos se renderizan en `<iframe srcDoc>` para aislar estilos
- Panel de revisión visible solo para roles `docente` y `coordinacion`
