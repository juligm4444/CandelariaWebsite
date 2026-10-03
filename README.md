# Candelaria Solar Car

Sitio del semillero de investigación Candelaria Solar Car, Universidad de los
Andes. <https://candelaria.website>

---

## Stack

| Capa | Herramienta |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Estilos | Tailwind CSS 4, tokens del manual de marca |
| Base de datos | Supabase (Postgres) |
| Autenticación | better-auth |
| Pagos | Polar.sh |
| Correo | Resend |
| Analítica | PostHog |
| Despliegue | Vercel |
| 3D | three.js vía react-three-fiber |

Sin backend aparte: todo corre en Next.js. Las rutas de API y las Server
Actions son el servidor.

---

## Empezar

```bash
cp .env.example .env.local   # rellena los valores, ver docs/MANUAL_SETUP.md
npm install
npm run dev
```

El sitio arranca sin base de datos ni claves: las páginas públicas muestran su
estado vacío en lugar de romperse. Para entrar, apoyar o publicar hacen falta
los pasos 1 a 3 de [`docs/MANUAL_SETUP.md`](docs/MANUAL_SETUP.md).

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run typecheck` | TypeScript sin emitir |
| `npm run lint` | ESLint |

---

## Estructura

```
app/                  Rutas, Server Actions y endpoints de API
  actions/            Server Actions (perfil, panel, idioma)
  api/                auth, checkout, webhook de Polar, portal, contacto
components/           Interfaz, agrupada por dominio
content/              Todo el texto y el catálogo, en español e inglés
lib/
  auth/               Configuración de better-auth y ayudas de sesión
  db/                 Consultas parametrizadas sobre Postgres
  email/              Resend y plantillas
  payments/           Polar
  i18n/               Diccionarios y resolución de idioma
supabase/migrations/  Esquema, en orden
docs/                 Marca, diseño, seguridad y puesta en marcha
public/brand/         Isotipos institucional y por área
public/fonts/         Sansation en woff2
```

---

## Documentación

| Documento | Para qué |
|---|---|
| [`docs/MANUAL_SETUP.md`](docs/MANUAL_SETUP.md) | **Empieza aquí.** Cuentas, claves, migraciones y lo que falta por decidir |
| [`docs/brand/candelaria-marca.md`](docs/brand/candelaria-marca.md) | Manual de marca. La fuente de verdad visual |
| [`docs/DESIGN.md`](docs/DESIGN.md) | Cómo se tradujo el manual a la web y por qué |
| [`docs/SECURITY.md`](docs/SECURITY.md) | Auditoría de seguridad y controles implementados |

---

## Idioma

El sitio es bilingüe (español por defecto, inglés). Todo el texto vive en
`content/es.ts` y `content/en.ts`. El inglés está tipado contra el español, así
que una clave añadida en uno y olvidada en el otro es un error de compilación,
no un panel en blanco en producción.

---

## Contribuir

Cada área publica sus avances desde el panel interno (`/dashboard`), no desde
el código. Para cambiar el sitio en sí, el área responsable es Diseño.

Antes de abrir un pull request:

```bash
npm run typecheck && npm run lint && npm run build
```

CI corre además Semgrep, CodeQL y `npm audit` en cada push.
