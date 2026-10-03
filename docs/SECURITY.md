# Auditoría de seguridad

Fecha: 2026-10-03. Alcance: todo el repositorio tras la migración a Next.js.

Herramientas: Semgrep 1.179 (497 reglas), CodeQL 2.27.1 (suites
`security-and-quality` y `security-extended`), `npm audit`, y revisión manual
de los cinco frentes pedidos.

---

## 1. Resultado de los escáneres

| Herramienta | Alcance | Hallazgos | Estado |
|---|---|---|---|
| Semgrep | 114 archivos, reglas `default`, `typescript`, `react`, `nextjs`, `secrets`, `sql-injection`, `xss`, `owasp-top-ten`, `github-actions` | 0 | Limpio tras corregir 1 |
| CodeQL `security-and-quality` | 100 archivos TS/JS + 1 workflow | 0 | Limpio |
| CodeQL `security-extended` | 99 archivos | 0 | Limpio |
| `npm audit --omit=dev` | dependencias de ejecución | 0 | Limpio |
| `npm audit` (con dev) | 5 altas, todas transitivas de `eslint-config-next` | 5 | Aceptadas, ver §4 |

### Hallazgos corregidos durante la auditoría

**1. Acciones de GitHub ancladas a tags mutables** (Semgrep,
`github-actions-mutable-action-tag`, 8 ocurrencias en `.github/workflows/ci.yml`).

Un tag como `@v5` lo controla el repositorio de origen y puede repuntarse a
código nuevo, que se ejecutaría con el token del workflow. Es la vía de
compromiso de cadena de suministro clásica en Actions.
Corregido anclando cada acción a su SHA de commit.

**2. Falso positivo**: una cadena con forma de token OAuth dentro de
`tsconfig.tsbuildinfo`, un artefacto de compilación que no debería estar
versionado. Añadido a `.gitignore` y eliminado.

---

## 2. Los cinco frentes pedidos

### Unsafe HTML

Sin `dangerouslySetInnerHTML`, `innerHTML`, `outerHTML`, `document.write`,
`insertAdjacentHTML`, `eval` ni `new Function` en todo el código de la
aplicación. Verificado por búsqueda directa y por las reglas de XSS de Semgrep
y CodeQL.

Todo texto que escribe una persona (resúmenes de publicación, nombres,
mensajes de contacto) se renderiza como texto por React. El único lugar donde
se construye HTML a mano son los correos, y ahí cada valor pasa por
`escapeHtml` antes de interpolarse
([`lib/email/templates.ts`](../lib/email/templates.ts)): el nombre de un
integrante es entrada controlable por quien la escribe, y sin escapar sería
inyección directa en el cliente de correo de quien lo recibe.

La política de seguridad de contenido añade la segunda capa: `script-src` con
nonce por petición y `strict-dynamic`, sin `unsafe-inline`.
`object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'`.

### Exposed Tokens

Todo módulo que lee un secreto importa `server-only`, lo que convierte en
error de compilación cualquier intento de importarlo desde un Componente de
Cliente: `lib/env.ts`, `lib/auth/server.ts`, `lib/db/*`, `lib/storage.ts`,
`lib/payments/polar.ts`, `lib/email/*`, `lib/rate-limit.ts`,
`lib/analytics/server.ts`, `lib/i18n/server.ts`.

Verificado además que ningún archivo con `'use client'` menciona
`SUPABASE_SERVICE_ROLE_KEY`, `POLAR_ACCESS_TOKEN`, `RESEND_API_KEY`,
`BETTER_AUTH_SECRET`, `DATABASE_URL` ni `POLAR_WEBHOOK_SECRET`.

`lib/env.ts` valida con Zod y, cuando falla, nombra solo las variables que
faltan. Nunca sus valores.

### Public API Keys

Solo hay tres variables `NEXT_PUBLIC_`, y ninguna es una credencial:

| Variable | Qué es | Por qué es segura |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Un nombre de host | Sirve para construir URL públicas de Storage. No autoriza nada. |
| `NEXT_PUBLIC_POSTHOG_KEY` | Clave de proyecto de PostHog | Pública por diseño: solo puede escribir eventos, nunca leerlos. |
| `NEXT_PUBLIC_POSTHOG_HOST` | Un nombre de host | — |

**No existe clave anónima de Supabase en este proyecto.** El navegador nunca
habla con Supabase: los datos los lee el servidor por la conexión de Postgres y
Storage solo se escribe desde el servidor con la `service_role`. Esto elimina
toda una clase de errores de RLS.

Como defensa en profundidad, las migraciones activan Row Level Security sin
política en todas las tablas y revocan explícitamente los permisos de los roles
`anon`, `authenticated` y `service_role`. Una clave filtrada de Supabase no lee
nada a través de PostgREST.

### Client Validation

La regla es que **toda validación de cliente existe solo para dar respuesta
inmediata**, y que el control real está siempre en el servidor:

| Entrada | Cliente | Servidor (el control real) |
|---|---|---|
| Membresía | Botón por nivel | El id de nivel se valida contra un enum (`cobre`/`aluminio`/`titanio`) en [`app/api/checkout/route.ts`](../app/api/checkout/route.ts) y el precio sale de `content/catalog.ts`, nunca del cliente |
| Registro | Longitud y coincidencia | better-auth: mínimo 12 caracteres, más el plugin *Have I Been Pwned*, que rechaza contraseñas filtradas sin enviar la contraseña a ningún sitio |
| Perfil | Campos requeridos | Zod, y `areaKey`/`internalRole`/`isActive` **no están en el esquema**: nadie puede ascenderse a sí mismo |
| Publicación | Campos requeridos | Zod, más verificación de pertenencia al área |
| Contacto | Campos requeridos | Zod, campo trampa y límite de 5 por hora e IP |
| Filtros de publicaciones | — | Cada valor se compara contra un conjunto conocido antes de llegar a SQL |
| Token de restablecimiento | Forma | Lo verifica better-auth; caduca en una hora y es de un solo uso |
| `?next=` al entrar | — | `safeRedirectPath` rechaza todo lo que no sea una ruta del propio sitio |

Autorización: cada Server Action vuelve a leer la sesión y a comprobar los
permisos. La interfaz oculta lo que no puedes hacer, pero eso no es un control:
los controles están en [`app/actions/dashboard.ts`](../app/actions/dashboard.ts)
y en las propias consultas. Borrar una publicación lleva el área en la cláusula
`WHERE`, así que un id de otra área no borra nada en vez de depender de una
comprobación aparte que pueda desincronizarse.

### Dependency Risks

`npm audit --omit=dev` da **0 vulnerabilidades**: nada de lo que llega al
navegador o al servidor tiene aviso abierto.

Los 5 avisos restantes son de desarrollo, encadenados:
`eslint-config-next` → `@next/eslint-plugin-next` → `fast-glob` →
`micromatch` → `braces` (GHSA-vfj7-8cjw-p6xm, agotamiento de pila con patrones
muy anidados).

- Ya está instalada la última versión publicada de cada paquete
  (`braces@3.0.3`, `micromatch@4.0.8`). **El aviso cubre `<= 3.0.3`, es decir,
  todas las versiones existentes: no hay versión corregida.**
- El único "arreglo" que propone npm es bajar a `eslint-config-next@14.2.35`,
  que arrastra la misma cadena y además rompería el linting de Next 16.
- Exposición real: `fast-glob` recorre rutas de nuestro propio repositorio en
  tiempo de desarrollo. El patrón no lo controla nadie de fuera.

**Decisión: aceptar y vigilar.** El workflow de CI corre `npm audit` semanalmente
y falla solo si aparece algo en las dependencias de ejecución.

---

## 3. Controles implementados

### Autenticación
- Correo y contraseña únicamente. Sin proveedores sociales que auditar.
- Mínimo de 12 caracteres, por encima del valor por defecto de la librería.
- Contraseñas filtradas rechazadas con *Have I Been Pwned* por k-anonimato:
  solo salen los cinco primeros caracteres del SHA-1.
- Verificación de correo obligatoria antes de emitir sesión.
- Restablecer la contraseña revoca todas las sesiones abiertas y envía un aviso
  al correo de la cuenta.
- Mensajes de error idénticos para correo inexistente y contraseña incorrecta,
  en el inicio de sesión y en el formulario de recuperación: cualquier
  diferencia convierte el formulario en un oráculo de enumeración de cuentas.
- Cookies `httpOnly`, `SameSite=Lax`, `Secure` en producción, prefijo `cdl`.

### Autorización de membresía interna

La cuenta interna (con área y rol) **nunca** se otorga por el dominio del
correo. Un correo `@uniandes.edu.co` que se registra sin invitación previa
queda como apoyo externo, igual que cualquier simpatizante. El único camino a
una cuenta interna es:

1. Una invitación que ya creó un líder o co-líder desde `/dashboard`
   (`inviteMemberAction`), consumida de un solo uso al registrarse
   (`area_invites`, columna `consumed_at`).
2. O, para la primera persona de cada área, un `UPDATE` manual en Supabase que
   solo tú ejecutas (`docs/MANUAL_SETUP.md` §2.4).

`INTERNAL_EMAIL_DOMAINS` no decide quién entra: decide **a qué dominios puede
invitar un líder**. Es una segunda barrera — si alguien compromete la cuenta
de un líder, igual no puede invitar un correo fuera de la universidad. Un
intento de hacerlo queda en `audit_log` como `invite.domain_rejected`.

Cada líder solo puede revocar, ascender a co-líder o transferir el liderazgo
**dentro de su propia área** (`canManageArea` / `isAreaLeader`). No hay
aprobación de un segundo nivel (por ejemplo, del Comité) sobre estas acciones.

### Limitación de peticiones
Almacenada en base de datos, no en memoria. En Vercel un limitador en memoria
se reinicia en cada arranque en frío y no limita nada.

| Acción | Ventana | Máximo |
|---|---|---|
| Inicio de sesión | 5 min | 8 |
| Registro | 1 h | 5 |
| Recuperar contraseña | 1 h | 5 |
| Restablecer contraseña | 1 h | 8 |
| Checkout | 5 min | 10 |
| Portal de facturación | 5 min | 10 |
| Contacto | 1 h | 5 |
| Guardar perfil | 1 min | 10 |
| Invitar integrante | 1 h | 30 |
| Crear publicación | 1 h | 20 |

El limitador **falla cerrado**: si no puede llegar a la base de datos, deniega.
Lo contrario convertiría una caída de base de datos en una puerta abierta.

### Pagos
- Ningún dato de tarjeta pasa por este sitio. El checkout lo aloja Polar.
- La firma del webhook se verifica contra el cuerpo **sin parsear**.
- El id de evento del proveedor es clave primaria en `payment_webhook_events`:
  una entrega repetida es un conflicto de clave, no un segundo cobro.
- La liquidación es idempotente también en SQL (`status <> 'succeeded'`).
- Una firma inválida queda registrada en `audit_log` con severidad `critical`.
- Los importes se recalculan siempre en el servidor desde el catálogo.

### Subida de archivos
- Tipo verificado por **bytes mágicos**, no por el nombre ni por la cabecera
  que declare el cliente.
- Límites: 5 MB para imagen, 10 MB para PDF, y los mismos límites en el bucket.
- La ruta se construye con valores de confianza (id de sesión, clave de área).
  El nombre del archivo subido nunca forma parte de la ruta, así que no hay
  recorrido de directorios posible.

### Base de datos
- Consultas parametrizadas en todos los casos. No hay interpolación de entrada
  de usuario en SQL en ningún punto de `lib/db/`.
- Reglas de negocio garantizadas por restricciones, no solo por código: un
  líder y un co-líder activos por área (índices únicos parciales), estados
  válidos (`CHECK`), importes positivos, un usuario externo no puede tener área.
- Transferir el liderazgo ocurre en una transacción, para que el índice único
  nunca llegue a ver dos líderes.
- `audit_log` registra actor, acción, objetivo, severidad, IP y momento.

### Cabeceras
`Content-Security-Policy` con nonce por petición y `strict-dynamic`, HSTS a
dos años con `preload`, `X-Frame-Options: DENY`, `X-Content-Type-Options`,
`Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`
denegando cámara, micrófono, ubicación, pago y USB, y las dos cabeceras
`Cross-Origin-*` en `same-origin`.

`style-src` conserva `unsafe-inline` porque React escribe atributos `style`
en línea (el área de protección de las marcas, las barras de color de área) y
no existe mecanismo de nonce para atributos de estilo. Un estilo en línea no
ejecuta código.

`script-src` añade `unsafe-eval` **solo en desarrollo**: la build de desarrollo
de React usa `eval` para reconstruir trazas. La política de producción no lo
lleva.

### Privacidad
- PostHog sin grabación de sesión, sin autocaptura, con perfiles solo para
  cuentas identificadas y respetando Do Not Track.
- Las vistas de página solo mandan la ruta. Las cadenas de consulta de este
  sitio pueden llevar un token de restablecimiento y no pueden llegar a un
  proveedor de analítica.
- Las páginas de cuenta llevan `noindex` y están excluidas en `robots.txt`.

---

## 4. Riesgos aceptados

| Riesgo | Por qué se acepta |
|---|---|
| `braces` / `micromatch` / `fast-glob` en dependencias de desarrollo | Sin versión corregida publicada. Solo tiempo de build, con patrones no controlables desde fuera. Vigilado semanalmente en CI. |
| `style-src 'unsafe-inline'` | Necesario para los atributos `style` de React. No permite ejecución. |
| Aviso de privacidad y términos sin revisión legal | Escritos a partir del comportamiento real del código. Pendiente de validación, ver `docs/MANUAL_SETUP.md` §8. |

---

## 5. Cómo repetir la auditoría

```bash
# Semgrep
EIO_BACKEND=posix semgrep scan \
  --config=p/default --config=p/typescript --config=p/react \
  --config=p/nextjs --config=p/secrets --config=p/sql-injection \
  --config=p/xss --config=p/owasp-top-ten --config=p/github-actions \
  --exclude=node_modules --exclude=.next --jobs 1

# CodeQL
codeql database create /tmp/cqdb --language=javascript-typescript --source-root=.
codeql database analyze /tmp/cqdb --format=sarif-latest \
  --output=codeql.sarif javascript-security-and-quality.qls

# Dependencias
npm audit --omit=dev
```

`EIO_BACKEND=posix` hace falta cuando el entorno restringe `io_uring`; sin esa
variable Semgrep aborta con *Cannot allocate memory* y analiza cero archivos,
lo que es fácil confundir con un resultado limpio.

El workflow [`ci.yml`](../.github/workflows/ci.yml) corre las tres en cada
push, en cada pull request y una vez por semana.
