# Lo que tienes que hacer tú

Todo lo que no se puede resolver desde el código: cuentas de terceros, claves,
precios reales y activos de marca. Ordenado por lo que bloquea primero.

**Dónde se pega todo:** un único archivo, `.env.local`, en la raíz del
proyecto (al lado de `package.json`). No existe todavía — lo creas en el paso
0. Cada clave que consigas de un proveedor se pega ahí, en la línea que
empieza con el nombre de esa variable. En producción (Vercel) las mismas
claves van en **Settings → Environment Variables** del proyecto, no en este
archivo — eso está en el paso 6.

---

## 0. Crear el archivo donde vas a pegar todo

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
cp .env.example .env.local
```

Esto crea `.env.local` copiando `.env.example`. Ábrelo con cualquier editor de
texto (VS Code, Notepad, lo que uses). Vas a ver líneas como:

```
DATABASE_URL=postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=
```

En cada paso de abajo te digo: "busca la línea `NOMBRE_DE_VARIABLE=` en
`.env.local` y pon después del `=` el valor que copiaste". Eso es *literalmente*
borrar lo que hay después del `=` (si hay algo) y escribir el valor nuevo,
pegado, sin espacios y sin comillas.

Después de editar `.env.local`, guarda el archivo e instala y arranca:

```bash
npm install
npm run dev
```

Abre `http://localhost:3000` en el navegador. El sitio carga sin que hayas
tocado nada más: las páginas públicas muestran su estado vacío en vez de
romperse. Para entrar, apoyar o publicar necesitas los pasos 1 a 3.

---

## 1. Supabase (base de datos y archivos) — BLOQUEANTE

### 1.1 Crear el proyecto

1. Ve a <https://supabase.com> e inicia sesión (o crea cuenta).
2. Botón **New project**.
3. Elige una organización (o créala), ponle nombre al proyecto (por ejemplo
   `candelaria`), genera una contraseña de base de datos **y guárdala en un
   gestor de contraseñas** — la vas a necesitar en el paso 1.2 y Supabase no
   te la vuelve a mostrar.
4. En **Region** elige `East US (North Virginia)` — es la de menor latencia
   desde Colombia.
5. Click **Create new project** y espera a que termine de aprovisionar
   (1-2 minutos).

### 1.2 Copiar la cadena de conexión → `DATABASE_URL`

1. Ya dentro del proyecto, en el menú lateral izquierdo: **Project Settings**
   (el ícono de engranaje, abajo del todo) **→ Database**.
2. Baja hasta la sección **Connection string**.
3. Verás varias pestañas: `URI`, `PSQL`, etc. Encima de esas pestañas hay un
   selector de modo de conexión — elige **Transaction pooler** (no "Session
   pooler" ni "Direct connection": el pooler de transacciones es el único que
   no se agota con muchas funciones serverless abriendo conexión a la vez,
   que es como funciona Vercel).
4. Copia el valor completo de la pestaña **URI**. Se ve así:
   ```
   postgresql://postgres.abcdefghijk:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
5. Pégalo en **`.env.local`**, en la línea `DATABASE_URL=`, reemplazando todo
   el valor de ejemplo. Antes de guardar, **reemplaza `[YOUR-PASSWORD]`** por
   la contraseña que generaste en el paso 1.1 (Supabase pone ese marcador
   literal ahí, no lo sustituye por ti).

   Resultado en `.env.local`:
   ```
   DATABASE_URL=postgresql://postgres.abcdefghijk:TuContraseñaReal@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```

### 1.3 Copiar la URL del proyecto → `NEXT_PUBLIC_SUPABASE_URL`

1. En el mismo menú: **Project Settings → API**.
2. Arriba, en la sección **Project URL**, copia el valor (algo como
   `https://abcdefghijk.supabase.co`).
3. Pégalo en **`.env.local`**, línea `NEXT_PUBLIC_SUPABASE_URL=`.

### 1.4 Copiar la clave de servicio → `SUPABASE_SERVICE_ROLE_KEY`

1. En la misma página (**Project Settings → API**), baja hasta
   **Project API keys**.
2. Hay dos claves: `anon` `public` y `service_role` `secret`. **Copia la
   `service_role`** (botón de copiar al lado, o click en "Reveal" si está
   oculta).
3. Pégala en **`.env.local`**, línea `SUPABASE_SERVICE_ROLE_KEY=`.

   > Esta clave da acceso total a tu base de datos sin restricciones. No la
   > copies en ningún chat, issue de GitHub público ni la subas a git. El
   > archivo `.env.local` ya está en `.gitignore`, así que `git status` nunca
   > debería mostrarlo — si alguna vez lo ves ahí, detente y pregunta.

   La línea `SUPABASE_STORAGE_BUCKET=media` ya viene correcta, no la toques.

### 1.5 Crear las tablas (ejecutar las migraciones)

1. En el menú lateral: **SQL Editor** (ícono de `</>`).
2. Click **New query**.
3. En tu editor de código, abre el archivo
   `supabase/migrations/20261002120000_better_auth.sql`, selecciona todo
   (Ctrl+A / Cmd+A), cópialo.
4. Pégalo en el SQL Editor de Supabase y click **Run** (o Ctrl+Enter).
   Debe decir "Success. No rows returned".
5. Repite exactamente lo mismo, en este orden, con los otros dos archivos:
   - `supabase/migrations/20261002120100_app_schema.sql`
   - `supabase/migrations/20261002120200_storage.sql`

   **El orden importa**: el segundo archivo usa tablas que crea el primero, y
   el tercero configura el bucket que usa el segundo. Si pegas el 2 antes que
   el 1, verás un error de "relation does not exist" — simplemente ejecuta el
   1 primero y vuelve a correr el 2.

6. Verifica: menú lateral **Table Editor**. Deberías ver las tablas `user`,
   `session`, `publications`, `contributions`, `memberships`, entre otras.
7. Verifica el bucket: menú lateral **Storage**. Debe existir un bucket
   llamado `media` marcado como público (ícono de candado abierto).

> **Si al usar el sitio en local te sale un error `SELF_SIGNED_CERT_IN_CHAIN`
> o "self-signed certificate in certificate chain"**: no es un problema de tu
> `DATABASE_URL`. Significa que algo en tu equipo o tu red — un antivirus, un
> firewall, la red de la universidad — está interceptando la conexión segura
> para inspeccionarla, y Node rechaza el certificado que mete en el medio.
> Reinicia `npm run dev` (`Ctrl+C` y vuelve a correrlo); el código ya está
> preparado para tolerar esto en desarrollo local y seguir conectándose de
> forma cifrada igual. En producción (Vercel) esto no ocurre y la verificación
> queda estricta sin que tengas que hacer nada.

---

## 2. better-auth (inicio de sesión) — BLOQUEANTE

### 2.1 Generar el secreto → `BETTER_AUTH_SECRET`

En tu terminal (no en Supabase, es un comando local):

```bash
openssl rand -base64 48
```

Esto imprime una cadena larga de letras y números, por ejemplo
`k3j9F2...==`. Cópiala y pégala en **`.env.local`**, línea
`BETTER_AUTH_SECRET=`.

> Si no tienes `openssl` (algunos Windows sin Git Bash), entra a
> <https://generate-secret.vercel.app/48> y copia el valor que te dé esa
> página.

**Guarda esta cadena en un gestor de contraseñas.** Si la cambias después de
que el sitio esté en producción, todas las personas con sesión iniciada se
desconectan de golpe.

### 2.2 Configurar la URL del sitio → `APP_URL`

En **`.env.local`**, la línea `APP_URL=` ya trae `http://localhost:3000`,
correcto para desarrollo. **No la toques ahora.** Cuando despliegues en
Vercel (paso 6), ahí sí la cambias a `https://candelaria.website` — pero esa
variable se pone en Vercel, no aquí.

### 2.3 Quién puede entrar como integrante interno

**Nadie entra como interno solo por tener un correo `@uniandes.edu.co`.**
Entrar como integrante (con área y rol) requiere siempre una invitación
creada por un líder o co-líder desde `/dashboard`. Si alguien se registra sin
invitación, su cuenta se crea como apoyo externo, igual que cualquier
simpatizante — puede donar, no aparece en el equipo ni ve el panel interno.

`INTERNAL_EMAIL_DOMAINS` (en **`.env.local`**, ya trae `uniandes.edu.co`) **no
otorga la cuenta interna**: solo decide **qué dominios de correo se pueden
invitar**. Es una segunda barrera — si alguien compromete la cuenta de un
líder, no puede invitar a un correo fuera de la universidad, aunque intente.
Si el correo institucional del semillero fuera otro o hay varios, sepáralos
con coma y sin espacios:

```
INTERNAL_EMAIL_DOMAINS=uniandes.edu.co,otrodominio.edu.co
```

La única puerta de entrada sin invitación previa es la del siguiente paso,
para los líderes que ya existen hoy — y es un paso que haces tú, una sola vez,
no algo que quede abierto después.

### 2.4 Sembrar los líderes actuales de cada área

**Antes de borrar las variables `TEAM_LEADERS_*` que viste en Vercel, cópialas
a un lugar seguro** (un gestor de contraseñas, una nota tuya — no las pegues
en ningún chat ni las subas a git). Esas variables tenían el correo real de
quien hoy lidera cada equipo, y es justo el dato que falta para este paso.
Haz una tabla rápida así, con lo que encuentres (puede que algunas estén
vacías si esa área no tenía líder cargado):

| Variable vieja en Vercel | Área en el sitio nuevo |
|---|---|
| `TEAM_LEADERS_EXECUTIVE_COMMITTEE` | `comite` |
| `TEAM_LEADERS_HUMAN_RESOURCES` | `rrhh` |
| `TEAM_LEADERS_DESIGN` | `diseno` |
| (sin equivalente exacto, confirma con el equipo) | `chasis` |
| `TEAM_LEADERS_CELLS` | `celdas` |
| `TEAM_LEADERS_LOGISTICS` | `logistica` |
| `TEAM_LEADERS_BATTERIES` | `baterias` |

> **Antes de registrar a nadie, completa el paso 3 (Resend) de esta guía.**
> Sin eso, el correo de confirmación nunca se manda — el sitio lo omite en
> silencio en desarrollo en vez de dar error — y te vas a quedar exactamente
> en "me registré pero no me llegó nada". Si ya intentaste registrar a alguien
> sin haber hecho el paso 3 todavía, no pasa nada: haz el paso 3 ahora, y
> luego entra a **`/verify-email`** con ese mismo correo para que le llegue el
> enlace de confirmación. ("¿Olvidaste tu contraseña?" **no** sirve para
> esto — cambia la contraseña, pero no confirma el correo; son dos cosas
> independientes.)

El panel interno (`/dashboard`) solo deja invitar a quien **ya** es líder o
co-líder. El primer líder de cada área no tiene a nadie que lo invite, así que
se siembra a mano, una sola vez por área. Hay dos formas de crear esa primera
cuenta — elige la que te quede más cómoda, el resultado es el mismo:

**Opción A — pides a cada líder que se registre él mismo.**
Le mandas el enlace de `/register` (o `http://localhost:3000/register` si
todavía estás en local) y que confirme el correo que le llega.

**Opción B — la registras tú, con el correo real de la persona.**

1. Abre `/register` en una **ventana de incógnito** (si lo haces desde tu
   navegador normal con tu propia sesión iniciada, el sitio te redirige a tu
   perfil en vez de dejarte registrar a otra persona).
2. Llena el formulario con el **nombre y correo real** del líder, y en
   contraseña escribe cualquier cosa de relleno (12 caracteres o más) — no
   hace falta anotarla, nunca se vuelve a usar.
3. El sitio le manda automáticamente, a la bandeja real de esa persona, un
   correo para confirmar la cuenta. **No hay forma de saltarse este correo**:
   aunque tú hayas creado la cuenta, nadie puede iniciar sesión hasta que el
   dueño del correo haga clic ahí — es justo lo que evita que alguien cree
   cuentas con correos que no controla.
4. Avísale a la persona (por el medio que uses) que revise su correo,
   incluido spam, por uno de "Candelaria Solar Car", y que haga clic antes de
   24 horas. Al hacerlo, queda con sesión iniciada automáticamente en su
   propio navegador — en ese momento no necesita ninguna contraseña.
5. Cuando esa sesión se le cierre y quiera volver a entrar, dile que use
   **"¿Olvidaste tu contraseña?"** con su propio correo para fijar la clave
   que solo ella va a conocer. Tú nunca inventas ni le entregas una clave real
   a nadie — eso evita que una contraseña viaje por WhatsApp o correo, donde
   queda guardada y es fácil de interceptar.

   > Hay un límite de **5 registros por hora** (protección contra registros
   > masivos automatizados), y te afecta igual si registras tú a los líderes.
   > Si vas a sembrar las siete áreas, haz cinco y espera una hora para las
   > otras dos, o repártelo en dos días.

Con cualquiera de las dos opciones, en cuanto el formulario de registro se
envía **ya existe la fila en la base de datos** (no hace falta esperar a que
confirmen el correo para el siguiente paso — el `update` solo toca el área y
el rol, no el estado de verificación).

**Una vez que ya exista la cuenta de cada líder (por A o por B), en Supabase:**

1. **SQL Editor → New query**. Pega el bloque completo de abajo, reemplazando
   cada `'correo@uniandes.edu.co'` por el correo real que recuperaste de cada
   variable. **Borra (o comenta con `--` al inicio de la línea) cualquier
   fila de un área que todavía no tenga líder confirmado** — no inventes un
   correo para rellenar.

   ```sql
   update "user" set "isInternal" = true, "areaKey" = 'comite',     "internalRole" = 'leader' where lower("email") = lower('correo@uniandes.edu.co');
   update "user" set "isInternal" = true, "areaKey" = 'rrhh',       "internalRole" = 'leader' where lower("email") = lower('correo@uniandes.edu.co');
   update "user" set "isInternal" = true, "areaKey" = 'diseno',     "internalRole" = 'leader' where lower("email") = lower('correo@uniandes.edu.co');
   update "user" set "isInternal" = true, "areaKey" = 'chasis',     "internalRole" = 'leader' where lower("email") = lower('correo@uniandes.edu.co');
   update "user" set "isInternal" = true, "areaKey" = 'celdas',     "internalRole" = 'leader' where lower("email") = lower('correo@uniandes.edu.co');
   update "user" set "isInternal" = true, "areaKey" = 'logistica',  "internalRole" = 'leader' where lower("email") = lower('correo@uniandes.edu.co');
   update "user" set "isInternal" = true, "areaKey" = 'baterias',   "internalRole" = 'leader' where lower("email") = lower('correo@uniandes.edu.co');
   ```

2. Click **Run**. Verifica en **Table Editor → user** que cada fila quedó con
   el `areaKey` y `internalRole = leader` correctos.

De ahí en adelante, cada líder invita a su propio equipo desde `/dashboard` —
tú no vuelves a tocar SQL para esto, ni para co-líderes ni para integrantes
normales.

### 2.5 Quién puede hacer qué dentro de un área

Esto es lo que quedó implementado. Confírmalo con el equipo — si algo no
coincide con cómo funcionaban antes, dímelo y lo ajusto:

| Acción | Líder | Co-líder | Integrante |
|---|---|---|---|
| Invitar nuevos integrantes a su área | Sí | Sí | No |
| Invitar/ascender a alguien como co-líder | Sí | No | No |
| Quitarle el acceso a un integrante o co-líder | Sí | No | No |
| Transferir el liderazgo a su co-líder | Sí | No | No |
| Publicar en la bitácora del área | Sí | Sí | Sí |
| Eliminar una publicación del área (incluida la propia) | Sí | Sí | No |

Hay como máximo **un líder y un co-líder activos por área** al mismo tiempo —
lo impone la base de datos, no solo la interfaz. Ninguna acción de estas pasa
por un segundo nivel de aprobación (por ejemplo, del Comité): el líder del
área decide sola esa área. Si ustedes quieren que ciertas acciones — como
nombrar co-líder o transferir el liderazgo — necesiten además que el Comité
las confirme, dímelo y agrego ese paso.

---

## 3. Resend (envío de correos) — BLOQUEANTE para recuperar contraseña

Sin esto configurado, **no se manda ningún correo**: ni de confirmación de
cuenta, ni de restablecer contraseña, ni el formulario de contacto. En
desarrollo verás un aviso en la consola de la terminal; en producción sería un
error silencioso para el usuario (se queda esperando un correo que no llega).

### 3.1 Crear la cuenta y verificar el dominio

1. Ve a <https://resend.com> y crea una cuenta.
2. Menú lateral: **Domains → Add Domain**.
3. Escribe `candelaria.website` (el dominio real del sitio) y click **Add**.
4. Resend te muestra 2 o 3 registros DNS (tipo `TXT` y `CNAME` normalmente).
   Cópialos uno por uno al panel donde administras el DNS de
   `candelaria.website` (GoDaddy, Namecheap, Cloudflare, lo que usen). Si no
   tienes acceso a ese panel, pídeselo a quien administre el dominio —
   probablemente Logística o el Comité.
5. Vuelve a Resend y click **Verify DNS Records**. Puede tardar desde minutos
   hasta un par de horas en propagar.

### 3.2 Crear la clave de API → `RESEND_API_KEY`

1. Menú lateral: **API Keys → Create API Key**.
2. Nombre: lo que quieras (ej. `candelaria-produccion`). Permission:
   **Sending access**. Domain: el que acabas de verificar.
3. Click **Add**. Te muestra la clave **una sola vez** — cópiala ya.
4. Pégala en **`.env.local`**, línea `RESEND_API_KEY=`.

### 3.3 Configurar el remitente → `RESEND_FROM`

En **`.env.local`**, busca la línea que empieza con `RESEND_FROM=` y
reemplázala por (usando tu dominio verificado):

```
RESEND_FROM=Candelaria Solar Car <no-reply@candelaria.website>
```

El dominio después de la `@` tiene que ser exactamente el que verificaste en
el paso 3.1, o Resend rechaza el envío.

### 3.4 Correo que recibe el formulario de contacto → `CONTACT_INBOX`

En **`.env.local`**, línea `CONTACT_INBOX=`, pon el correo donde quieres que
lleguen los mensajes de `/contact` (por ejemplo, el correo de Comité o de
Diseño):

```
CONTACT_INBOX=comite@candelaria.website
```

Si dejas esta línea vacía, el formulario de contacto del sitio deja de
funcionar (responde error 503) hasta que pongas un correo aquí.

---

## 4. Polar.sh (pagos) — opcional al principio

Mientras no completes esta sección, el sitio funciona igual pero los botones
de pago muestran un aviso de "no disponible". Puedes dejarlo para después.

### 4.1 Crear la organización y el token → `POLAR_ACCESS_TOKEN`

1. Ve a <https://polar.sh> y crea una cuenta / organización.
2. Arriba a la derecha o en el selector de modo, verifica que estés en
   **Sandbox** (modo de pruebas) mientras configuras todo por primera vez.
3. Menú: **Settings → Developers → New Token** (o "Create token").
4. Dale un nombre, alcance de **organización completa**, y en el selector de
   expiración elige **No expiration** si aparece esa opción; si solo hay
   fechas fijas, elige la más lejana disponible. Polar exige fijar una
   expiración al crear el token — no existe forma de dejarlo sin ese campo.
5. Click crear y copia el token (empieza por `polar_oat_` o similar). Pégalo
   en **`.env.local`**, línea `POLAR_ACCESS_TOKEN=`.
6. **Si el token tiene fecha de expiración**, anótala en el calendario del
   equipo con al menos una semana de margen: cuando expire, los pagos y el
   webhook dejan de funcionar sin ningún aviso visible en el sitio (el único
   síntoma es el error "no disponible" en los botones de pago). Para
   renovarlo: repite este paso generando un token nuevo y actualiza
   `POLAR_ACCESS_TOKEN` tanto en `.env.local` como en Vercel (paso 6.3).
7. La línea `POLAR_SERVER=sandbox` ya está correcta para pruebas. Cuando
   quieras cobrar de verdad, la cambias a `POLAR_SERVER=production` **y**
   repites este paso 4.1 generando un token en el modo producción de Polar
   (los tokens de sandbox y de producción son distintos, y cada uno expira
   por su cuenta).

### 4.2 Crear los tres productos → `POLAR_PRODUCT_*`

En Polar, menú **Products → Create Product**. Crea estos tres, uno por uno.
Después de crear cada uno, entra a su página de detalle y copia su **Product
ID** (lo ves en la URL, algo como `polar.sh/dashboard/.../products/0199...`,
o en un campo "ID" dentro de la página del producto).

> Polar es una plataforma de *merchant of record* solo para productos
> **digitales**, y su política de uso aceptable prohíbe directamente dos
> categorías que este proyecto quería usar:
> - **Mercancía física** (sudaderas, gorras, termos) — no hay forma de
>   describirla que la haga aceptable, así que no existe tienda de
>   mercancía en este proyecto.
> - **Donaciones** — Polar las lista como categoría de producto prohibida,
>   sin excepción por cómo se presenten ("aporte único", "pay what you
>   want", etc.). Por eso tampoco hay botón de aporte único: solo quedan
>   las tres membresías de abajo.
>
> Si en el futuro quieren mercancía física o donaciones, necesitan un canal
> de pago distinto a Polar para eso — no una forma distinta de describir el
> mismo producto dentro de Polar.

| Crea este producto en Polar | Tipo que eliges en Polar | Pega el ID en esta línea de `.env.local` |
|---|---|---|
| Membresía Cobre | Suscripción, recurrencia mensual | `POLAR_PRODUCT_COBRE=` |
| Membresía Aluminio | Suscripción, recurrencia mensual | `POLAR_PRODUCT_ALUMINIO=` |
| Membresía Titanio | Suscripción, recurrencia mensual | `POLAR_PRODUCT_TITANIO=` |

### 4.3 Configurar el webhook → `POLAR_WEBHOOK_SECRET`

Esto es lo que avisa al sitio cuando un pago se completa. Sin esto, alguien
puede pagar y el sitio nunca se entera.

1. En Polar: **Settings → Webhooks → Add Endpoint**.
2. **Endpoint URL**: si ya desplegaste en Vercel, pon
   `https://candelaria.website/api/webhooks/polar`. Si todavía estás en local
   y quieres probarlo, necesitas exponer tu `localhost` con algo como
   `ngrok` — si no sabes a qué se refiere esto, deja el webhook para cuando
   despliegues (paso 6) y sigue con el resto de pasos primero.
3. **Formato del payload**: elige `Raw` (no `Discord` ni otro formato).
4. **Eventos a enviar**, marca estos (puede que tengas que buscarlos en una
   lista con checkbox, uno por uno):
   `order.paid`, `order.refunded`, `subscription.created`,
   `subscription.active`, `subscription.cycled`, `subscription.past_due`,
   `subscription.canceled`, `subscription.revoked`, `subscription.uncanceled`.
5. Click crear. Polar te muestra un **Signing Secret** (empieza por
   `whsec_`). Cópialo y pégalo en **`.env.local`**, línea
   `POLAR_WEBHOOK_SECRET=`.

### 4.4 Precios reales

Los precios que trae el proyecto ahora mismo son de prueba. Tienes que
cambiarlos en **dos sitios que deben coincidir exactamente**:

1. Abre el archivo `content/catalog.ts` en tu editor de código. Busca
   bloques como:
   ```ts
   monthlyPrice: 2000000,
   ```
   Esos números son pesos colombianos multiplicados por 100 (son "centavos"
   para poder tener decimales en otras monedas). `2000000` = $20.000 COP.
   Cambia cada número por el precio real que decidieron.
2. Entra a cada producto en el panel de Polar (los que creaste en el paso
   4.2) y pon ahí el **mismo precio**, en la misma moneda.

Si los dos no coinciden, la persona ve un precio en la página del sitio y le
cobran otro distinto en la pantalla de pago de Polar — eso hay que evitarlo
siempre.

La membresía **Aluminio** promete "una pieza de equipación oficial al año"
como beneficio. Eso no se vende ni se cobra por separado — es una entrega
física que el equipo hace en persona a quien ya es miembro Aluminio, por
fuera de Polar. No hay nada que configurar para eso aquí; es un recordatorio
para quien gestione los beneficios de cada ciclo de membresías.

---

## 5. PostHog (analítica) — opcional

Si no haces esto, el sitio funciona exactamente igual, solo que sin
estadísticas de visitas. Mientras `NEXT_PUBLIC_POSTHOG_KEY` esté vacía en
`.env.local`, no se carga ningún script ni se hace ninguna petición a
PostHog.

1. Ve a <https://posthog.com>, crea una cuenta y un proyecto nuevo.
2. Al crear el proyecto, PostHog te pregunta la región: **US Cloud** o
   **EU Cloud**. Elige la que prefieras (US es la más común si no hay
   requisito de que los datos se queden en Europa).
3. Dentro del proyecto: **Project Settings** (ícono de engranaje) → en la
   parte de arriba verás **Project API Key**. Cópiala.
4. Pégala en **`.env.local`**, línea `NEXT_PUBLIC_POSTHOG_KEY=`.
5. En **`.env.local`**, línea `NEXT_PUBLIC_POSTHOG_HOST=`, pon:
   - `https://us.i.posthog.com` si elegiste US Cloud, o
   - `https://eu.i.posthog.com` si elegiste EU Cloud.

   Tiene que coincidir exactamente con la región que elegiste en el paso 2,
   o el navegador bloquea las peticiones a PostHog por la política de
   seguridad del sitio y no verás ningún dato.

Ya viene configurado sin grabación de pantalla y sin capturar el contenido de
formularios.

**Sobre `POSTHOG_API_KEY` (la variable opcional del paso 6.4):** no es una
clave distinta a la del paso 5.4. El código la usa solo para los eventos que
manda el servidor (un pago liquidado, una publicación creada); si la dejas
vacía, usa automáticamente la misma `NEXT_PUBLIC_POSTHOG_KEY` como respaldo
(ver `lib/analytics/server.ts`). No necesitas crearla ni buscarla en otro
lado — con la Project API Key del paso 5.3 ya queda cubierto todo.

---

## 6. Vercel (poner el sitio en internet)

Si el dominio `candelaria.website` ya está comprado y el proyecto de Vercel ya
existe y está conectado a este repositorio (el caso normal: venía de la
versión anterior del sitio), **salta directo al 6.1.** Si de verdad no existe
ningún proyecto todavía:

1. Ve a <https://vercel.com>, entra con tu cuenta de GitHub.
2. **Add New → Project**, elige el repositorio `CandelariaWebsite`.
3. Vercel detecta automáticamente que es Next.js. Continúa en 6.1 antes de
   darle a Deploy.

### 6.1 Revisar la configuración de build

El proyecto en Vercel puede traer configuración guardada de cuando el sitio
era Vite (antes de esta migración a Next.js). Revísala antes de desplegar:

1. **Settings → General → Build and Deployment**.
2. **Framework Preset**: debe decir **Next.js**. Si dice "Vite" u "Other",
   cámbialo.
3. En **Build Command**, **Output Directory** e **Install Command**, si ves
   un interruptor de *"Override"* **activado** en alguno (quedó de cuando el
   comando era `vite build` y la salida `dist`), **apágalo**, para que Vercel
   use los valores por defecto de Next.js.

### 6.2 Borrar las variables de entorno viejas

Ve a **Settings → Environment Variables**. Vas a ver una lista larga de
variables de la versión anterior del sitio (Django + Vite). El código actual
no lee ninguna de ellas. Bórralas todas, agrupadas aquí solo para que sea más
fácil encontrarlas:

**Backend Django (ya no existe ese código):**
`SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, `DJANGO_SETTINGS_MODULE`,
`FRONTEND_URL`, `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`, `DB_NAME`,
`DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_SSLMODE`,
`THROTTLE_ANON_RATE`, `THROTTLE_USER_RATE`, `THROTTLE_BURST_RATE`,
`THROTTLE_AUTH_RATE`, `DATA_UPLOAD_MAX_MEMORY_SIZE`,
`FILE_UPLOAD_MAX_MEMORY_SIZE`, `AUTH_MAX_ATTEMPTS`,
`AUTH_ATTEMPT_WINDOW_SECONDS`, `EMAIL_BACKEND`, `EMAIL_HOST`, `EMAIL_PORT`,
`EMAIL_USE_TLS`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`,
`DEFAULT_FROM_EMAIL`, `SECURITY_LOG_ENABLED`, `SECURITY_LOG_LEVEL`.

**Pagos viejos, Stripe/PayU (reemplazados por Polar, ver paso 4):**
`PAYMENT_PROVIDER`, `PAYMENT_PUBLIC_KEY`, `PAYMENT_SECRET_KEY`,
`PAYMENT_WEBHOOK_SECRET`, `PAYMENT_WEBHOOK_TOLERANCE_SECONDS`,
`PAYMENT_DEFAULT_CURRENCY`, `PAYMENT_MIN_AMOUNT_CENTS`,
`PAYMENT_MAX_AMOUNT_CENTS`, `PURCHASES_ENABLED`, `PAYU_MERCHANT_ID`,
`PAYU_ACCOUNT_ID`, `PAYU_API_KEY`, `PAYU_API_LOGIN`, `PAYU_TEST_MODE`.

**Frontend Vite (reemplazado por Next.js, que usa el prefijo `NEXT_PUBLIC_`,
no `VITE_`):** `VITE_API_ORIGIN`, `VITE_SUPABASE_URL`,
`VITE_SUPABASE_ANON_KEY`, `VITE_PAYMENT_PUBLIC_KEY`.

**Lista blanca de líderes vieja (reemplazada por invitaciones desde
`/dashboard`, ver paso 2.3):** `TEAM_LEADER_WHITELIST_ENABLED`,
`TEAM_LEADER_AUTO_ASSIGN`, `ADMIN_APPROVAL_REQUIRED`,
`TEAM_LEADERS_EXECUTIVE_COMMITTEE`, `TEAM_LEADERS_BATTERIES`,
`TEAM_LEADERS_CELLS`, `TEAM_LEADERS_CHASSIS`, `TEAM_LEADERS_LOGISTICS`,
`TEAM_LEADERS_DESIGN`, `TEAM_LEADERS_HUMAN_RESOURCES`,
`TEAM_LEADERS_VALIDATION_TEAM`.

> **Antes de borrar este último grupo**, si todavía no copiaste los correos
> reales de los líderes actuales a un lugar seguro, hazlo ahora — es el dato
> que necesitas para el paso 2.4. Una vez copiados, bórralas.

**Supabase del proyecto viejo (el que ya borraste) — con una trampa:**

| Variable vieja | Qué hacer |
|---|---|
| `SUPABASE_URL` | Bórrala. El nombre nuevo es distinto: `NEXT_PUBLIC_SUPABASE_URL` (la creas en el paso 6.3). |
| `SUPABASE_SERVICE_ROLE_KEY` | **No la borres y la dejes así** — este nombre es idéntico al que usa el sitio nuevo. Su valor actual es de la base de datos vieja que ya no existe. En el paso 6.3 la **editas** (no la borres primero) y le pones el valor del proyecto nuevo de Supabase (paso 1.4). |
| `SUPABASE_STORAGE_BUCKET` | Mismo nombre en los dos sistemas. Si su valor ya es `media`, es correcto tal cual — no la toques. |
| `DATABASE_URL` | Mismo caso que `SUPABASE_SERVICE_ROLE_KEY`: nombre idéntico, valor viejo e inútil. En el paso 6.3 la **editas** con el valor nuevo del paso 1.2, no la borres primero. |

### 6.3 Agregar las variables obligatorias

> **Si borraste todas las variables en el paso 6.2** (incluidas
> `DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` y `SUPABASE_STORAGE_BUCKET`, que
> la guía original decía editar en vez de borrar): no pasa nada, esta lista
> es completa por sí sola. Trátala como si el proyecto de Vercel estuviera
> vacío — crea las diez con **Add New**, sin asumir que ninguna ya existe.
> Antes de seguir, revisa igual la nota al final de esta sección sobre los
> correos de los líderes del paso 2.3/2.4: si esas variables (`TEAM_LEADERS_*`)
> también se borraron sin copiar su valor primero, ese dato sí se perdió de
> Vercel y hay que recuperarlo de otra forma.

Estas diez son las que el sitio necesita para funcionar de entrada. Para cada
una: **Add New**, pega el valor, y marca que aplique a **Production** y a
**Preview**.

| Variable | Valor | De dónde sale |
|---|---|---|
| `APP_URL` | `https://candelaria.website` (el dominio real, **no** `http://localhost:3000`) | — |
| `DATABASE_URL` | el mismo que pusiste en tu `.env.local` | paso 1.2 |
| `NEXT_PUBLIC_SUPABASE_URL` | el mismo | paso 1.3 |
| `SUPABASE_SERVICE_ROLE_KEY` | el mismo | paso 1.4 |
| `SUPABASE_STORAGE_BUCKET` | `media` | — |
| `BETTER_AUTH_SECRET` | el mismo | paso 2.1 |
| `INTERNAL_EMAIL_DOMAINS` | el mismo | paso 2.3 |
| `RESEND_API_KEY` | el mismo | paso 3.2 |
| `RESEND_FROM` | el mismo | paso 3.3 |
| `CONTACT_INBOX` | el mismo | paso 3.4 |

Con solo estas diez, el sitio ya funciona completo: entrar, publicar, apoyar
con membresías y recibir mensajes de contacto. Lo único que falta son los
pagos reales y la analítica — eso es el siguiente punto (6.4).

**Sobre los correos de los líderes (`TEAM_LEADERS_*` del paso 6.2):** esas
variables no se recrean aquí — nunca fueron parte del sitio nuevo, solo
eran la fuente de donde copiar los correos reales para el paso 2.4
(invitar a cada líder desde `/dashboard` una vez que tengas tu propia cuenta
registrada). Si las borraste sin copiar los valores a ningún lado:
- Si ya completaste el paso 2.4 para algún área (ya invitaste a ese líder),
  ese correo está a salvo en la base de datos — no depende de la variable.
- Si para alguna área **todavía no** hiciste la invitación, el correo del
  líder de esa área se perdió de Vercel. Tendrás que pedirlo de nuevo por
  otro medio (quien lo tenga a mano, un chat anterior con esa persona, etc.)
  — no hay forma de recuperarlo desde Vercel una vez borrada la variable.

### 6.4 Variables opcionales: Polar y PostHog — agrégalas cuando las tengas

**No crees estas variables en Vercel todavía si no tienes sus valores.** No
hace falta dejarlas vacías ni rellenarlas con algo provisional — simplemente
no existan en la lista, y el sitio funciona igual: los botones de pago
muestran un aviso de "no disponible" y no se cargan estadísticas de visitas.
Nada se rompe por no tenerlas.

Cuando termines el **paso 4** (Polar) o el **paso 5** (PostHog) de esta misma
guía, vuelve aquí y agrégalas igual que en 6.3 (Add New, marca Production y
Preview). Son estas, para que sepas cuáles esperar:

- De Polar (paso 4): `POLAR_ACCESS_TOKEN`, `POLAR_WEBHOOK_SECRET`,
  `POLAR_SERVER`, `POLAR_PRODUCT_COBRE`, `POLAR_PRODUCT_ALUMINIO`,
  `POLAR_PRODUCT_TITANIO`.
- De PostHog (paso 5): `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`,
  `POSTHOG_API_KEY` (esta última opcional incluso si configuras las otras
  dos).

Después de agregarlas no hace falta volver a tocar nada del código — solo
**Deployments → el deployment activo → menú `⋯` → Redeploy**, para que la
nueva variable entre en efecto.

### 6.5 Desplegar

Con 6.1 a 6.3 listos:

```bash
git add -A
git commit -m "Migrar a Next.js: Supabase, better-auth, Resend"
git push
```

El push dispara el deploy automático. Como el cambio de stack es grande
(Vite → Next.js), fuerza uno limpio por si Vercel tiene caché vieja de
dependencias: **Deployments** → en el más reciente, menú `⋯` → **Redeploy** →
**desmarca** "Use existing Build Cache".

### 6.6 Dominio

**Settings → Domains.** Verifica que `candelaria.website` (sin `www`) esté
marcado como el dominio primario, y que `www.candelaria.website` tenga la
flecha de **Redirect** apuntando hacia `candelaria.website` — no al revés.
Si `www` apareciera como primario, usa el "Edit" de esa pantalla para
cambiarlo.

### 6.7 Volver a Polar

Cuando configures el paso 4.3 (el webhook de Polar), si al crearlo pusiste un
marcador de posición porque el dominio todavía no respondía, vuelve a Polar y
actualiza la URL del endpoint con `https://candelaria.website/api/webhooks/polar`
ya funcionando de verdad.

---

## 7. Activos de marca pendientes

Nada de esto impide que el sitio funcione. Son mejoras visuales para cuando
tengan el material.

| Qué falta | Dónde se usa | Qué hay mientras tanto |
|---|---|---|
| **Logo oficial en SVG** (el lockup horizontal exportado de Figma) | Reemplaza el archivo que usa `components/brand/lockup.tsx` | Hoy se arma por código a partir del isotipo (PNG) y texto. Para reemplazarlo: exporta el SVG desde Figma, ponlo en `public/brand/`, y pide que te ayuden a conectar el archivo si no editas código. |
| **Isotipo en SVG** (en vez de imagen) | `public/brand/` | Son imágenes WebP, se ven bien en pantalla pero no son vectores. |
| **Logo de la Universidad de los Andes** | Aparece como texto en la portada, sección "Con el respaldo de" | Pide autorización a Comunicaciones de Uniandes antes de poner su logo. |
| **Fotos de los integrantes** | Cada persona la sube ella misma, en `/profile`, una vez tenga su cuenta | Sin foto, se les muestra su inicial sobre el color de su área. |

Las cuatro imágenes de fondo (fibra de carbono, celda solar, baterías, luz de
taller) son ilustraciones generadas, no fotos reales del taller. Cuando
tengan fotografía real del semillero, reemplácenlas.

---

## 8. Contenido que solo ustedes pueden decidir

Esto son textos, no claves — se edita directamente en los archivos de
código, con cualquier editor de texto.

| Archivo a abrir | Qué buscar y cambiar |
|---|---|
| `content/es.ts` | Busca `vehicle.status.groups` dentro del archivo. Ahí hay un tablero con filas marcadas como "en simulación" o "por definir" para cada parte técnica del vehículo. Pide a cada área real su estado actual y actualiza esas líneas. No se inventó ningún número — mejor un "por definir" honesto que un dato falso. |
| `content/es.ts` | Busca `about.chapters`. Ahí está la historia del semillero con el año de fundación puesto como 2022. Confirma la fecha real con quien tenga esa información. |
| `content/catalog.ts` | Precios reales de cada membresía (ver también el paso 4.4, que tiene que coincidir con Polar). |
| `content/legal.ts` | Aviso de privacidad y términos de uso. Están escritos describiendo exactamente lo que el código hace, pero no los revisó un abogado. Antes de empezar a cobrar, que alguien de Logística o del Comité los revise. |
| `components/layout/footer.tsx` | Busca las URL de Instagram, LinkedIn y GitHub. Verifica que sean las cuentas reales del semillero. |

---

## 9. Antes de abrir el sitio al público

Corre esto en la terminal, en la carpeta del proyecto:

```bash
npm run typecheck && npm run lint && npm run build
```

Si los tres terminan sin errores, el código está sano. Después, ya con el
sitio desplegado en Vercel, prueba a mano:

- [ ] Crear una cuenta nueva en `/register` y que llegue el correo de
      confirmación.
- [ ] Pedir "olvidé mi contraseña" y que el enlace del correo funcione.
- [ ] Entrar con esa cuenta y que cargue `/profile`.
- [ ] Que un líder invite a alguien desde `/dashboard`, esa persona se
      registre, y aparezca en `/team`.
- [ ] Enviar un mensaje desde `/contact` y que llegue al correo que pusiste
      en `CONTACT_INBOX`.
- [ ] *(solo si ya completaste el paso 4 y el 6.4)* Suscribirte a una
      membresía de prueba en modo sandbox de Polar y verla aparecer en
      `/purchases`.

---

## 10. Si algo sale mal

| Lo que ves | Dónde está el problema probablemente |
|---|---|
| El deploy falla buscando `dist/` o corriendo `vite build` | El **Framework Preset** en Vercel sigue en Vite/Other, o hay un "Override" de build activado de la versión vieja (paso 6.1). |
| Todas las páginas dan error 500 | Revisa `DATABASE_URL` en Vercel (paso 1.2 / 6.3) — un typo ahí tumba todo el sitio. O falta correr alguna migración (paso 1.5). |
| En local sale `SELF_SIGNED_CERT_IN_CHAIN` al registrarte o iniciar sesión | Tu red o tu antivirus está interceptando la conexión segura a Supabase. No es un error de configuración — reinicia `npm run dev` (ver nota al final del paso 1.5). Si persiste, prueba desde otra red (datos móviles) para confirmar que es eso. |
| Entras y te saca de inmediato | `APP_URL` en Vercel no coincide con el dominio real que estás usando (paso 2.2 / 6.3), o `www` y sin-`www` están al revés (paso 6.6). |
| No llega ningún correo | `RESEND_API_KEY` vacía, o el dominio sin verificar todavía en Resend (paso 3.1). Revisa la terminal: si ves `[email] skipped (no RESEND_API_KEY)`, confirmado. |
| "Confirma tu correo antes de entrar" y nunca llegó el enlace, o ya caducó | Entra a `/verify-email` con ese correo para que te manden uno nuevo. "¿Olvidaste tu contraseña?" no sirve para esto: cambia la clave, pero no confirma el correo. |
| El botón de pago muestra "no disponible" | Es el comportamiento normal mientras no completes el paso 4 (Polar) y agregues esas variables en Vercel (paso 6.4). No es un error. |
| El botón de pago da error al hacer clic (no solo "no disponible") | Falta `POLAR_ACCESS_TOKEN` o el ID del producto correspondiente en Polar, ya agregados en Vercel pero con un valor incorrecto (paso 4.1 / 4.2). |
| Pagaron pero no aparece en `/purchases` | El webhook de Polar no está bien configurado, o el "Signing Secret" no coincide (paso 4.3). En Supabase, **Table Editor → audit_log**, busca filas con `action = webhook.signature_invalid`. |
| No se ven visitas en PostHog | `NEXT_PUBLIC_POSTHOG_HOST` no coincide con la región que elegiste al crear el proyecto (paso 5). |

La tabla `audit_log` (en Supabase, **Table Editor → audit_log**) guarda quién
hizo qué, desde qué dirección IP y cuándo, para cada acción sensible. Es el
primer sitio donde mirar cuando algo no cuadre.
