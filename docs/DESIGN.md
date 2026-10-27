# Sistema de diseño

Decisiones tomadas al rehacer el frontend. La fuente de verdad visual es
[`docs/brand/candelaria-marca.md`](brand/candelaria-marca.md); este archivo
explica cómo se tradujo a la web y por qué, allí donde el manual deja margen.

---

## 1. Un solo tema

**No hay modo claro ni modo oscuro.** No existe conmutador, ni cookie de tema,
ni `prefers-color-scheme`, ni atributo `data-theme`. Todo lo relacionado con
eso se eliminó del proyecto.

El manual publica dos juegos de variables semánticas y una proporción por
pieza: Morado profundo 45%, Neutro 30%, Dorado 15%, Violeta 6%, Lavanda 4%
(§4.3). La proporción manda, así que el lienzo del sitio es **Morado profundo
300** y el Neutro 100 aparece como *papel*: bandas e insertos deliberados para
secciones de lectura larga, formularios legales y el tablero de estado.

El manual también pide fondos alternados para separar secciones (§7). Se
cumple, pero con una regla: las dos familias de superficie están definidas una
sola vez y un componente escrito una vez se lee bien en ambas. La clase
`.on-paper` reapunta las mismas variables semánticas en lugar de duplicar
estilos.

```
:root        → lienzo morado,  texto neutro,  acento #FFB938
.on-paper    → lienzo neutro,  texto morado,  acento #866018
```

Por eso el botón primario se invierte solo según dónde esté, y por eso el
acento dorado cambia de tono: `#FFB938` sobre claro da 2.85:1 y el manual lo
prohíbe expresamente (§4.4).

---

## 2. Tipografía

| Rol | Familia | Cómo se sirve |
|---|---|---|
| Títulos | Sansation | Self-hosted en woff2 desde `public/fonts/` |
| Texto | Helvetica Now | Pila de respaldo del manual, con Inter delante |

Helvetica Now es una fuente licenciada que no se puede distribuir. El manual
dice exactamente qué hacer en ese caso: usar la pila de respaldo y **no
sustituirla por una fuente de aspecto distinto** (§5). Los archivos de Figma la
montan provisionalmente sobre Inter, así que Inter es el sustituto documentado
y va delante de `Helvetica Neue, Helvetica, Arial`.

La escala respeta el múltiplo de 8 del manual, con **16 px como suelo**. No hay
texto de 14 ni de 12 en ningún sitio: el manual lo prohíbe y, de paso, sube el
mínimo de legibilidad. Donde haría falta un texto "pequeño" se usa 16 px con
opacidad o mayúsculas, nunca un tamaño menor.

El tracking es 0% en todo, incluidas las etiquetas. Eso es lo que evita el
típico rótulo de sección en versalitas muy espaciadas.

---

## 3. Geometría

- Radios: 24 px en bloques, 16 px en tarjetas, 12 px en píldoras y botones.
  Logotipo e iconos nunca llevan radio.
- Espaciado en múltiplos de 8: 8 / 16 / 24 / 32 / 40 / 56 / 72 / 120.
- Margen lateral de 6.25% del ancho con suelo de 24 px, que es cómo se resuelve
  la retícula de 120 px sobre 1920 del manual. El contenido ocupa todo el
  ancho entre esos márgenes: no hay columna fija (antes había un tope de
  1400 px que en QHD y 4K dejaba el sitio en una franja central). El único
  tope es 120rem, que solo actúa en pantallas ultra anchas (21:9).
- **Pantallas grandes.** Todo se diseña sobre el lienzo de 1920 × 1080 del
  manual, en rem. Hasta ese lienzo la raíz es 16 px; por encima, crece con el
  lado de la pantalla que menos crece (`html { font-size: clamp(100%,
  min(100vw / 120, 100vh / 67.5), 200%) }`), así que QHD y 4K muestran la misma
  composición que 1920, más grande. En 4K el factor es exactamente 2 y los
  múltiplos de 8 siguen siéndolo. Los anchos fijos van en rem para escalar
  igual; las media queries no se mueven (usan el tamaño inicial del
  navegador).
- **Sin sombras.** La profundidad sale del contraste de fondo. La única
  excepción permitida es un halo radial de Morado 100 sobre Morado 300, que es
  la clase `.halo-brand`.
- Línea divisoria de 1 px al 14–18% del color de texto.

---

## 4. Iconografía

**Tabler Icons.** La elección no es estética: el manual especifica retícula de
24 × 24, trazo de 2 px, sin relleno y terminaciones redondeadas (§6). Tabler
dibuja exactamente así, de fábrica. Ninguna otra familia habitual coincide sin
retocar cada icono.

No hay ningún SVG de icono dibujado a mano, y no se usan emojis como iconos.

---

## 5. Movimiento e interacción

### Regla general

El contenido está visible por defecto. Ninguna animación que dependa de
JavaScript arranca ocultando texto: si el script falla, se bloquea o nunca
llega, la página se lee igual. El revelado por scroll es CSS puro
(`animation-timeline: view()`).

`prefers-reduced-motion` se lee con `usePrefersReducedMotion`
([`lib/use-reduced-motion.ts`](../lib/use-reduced-motion.ts)), no con el hook
de Motion: el de Motion lee la preferencia durante la hidratación y produce un
error de hidratación para quien tiene el movimiento reducido. Si un componente
puede resolverse solo con CSS (`motion-reduce:`), mejor: la banda de valores
renderiza las dos versiones y el CSS elige.

### Luz de interacción (no sombra)

El manual prohíbe sombras, así que todo hover y todo clic responde con **luz**:
degradados pintados dentro del elemento, de la misma familia que `.halo-brand`.
Las clases están en `app/globals.css` (sección "Interaction light") y las
alimenta [`components/interaction/interaction-layer.tsx`](../components/interaction/interaction-layer.tsx),
un único listener delegado que escribe la posición del puntero en `--mx`/`--my`
del `[data-light]` más cercano.

| Clase / atributo | Efecto |
|---|---|
| `.cdl-light` | Halo radial que sigue al puntero (`--cdl-light-rgb`, `--cdl-light-alpha`, `--cdl-light-size`) |
| `.cdl-light-edge` | El borde de 1 px se ilumina cerca del puntero |
| `.cdl-sheen` | Una banda de luz cruza el botón dorado una vez al entrar |
| `.cdl-link` | Enlace de texto: halo detrás, los glifos se iluminan, flecha que avanza. Nunca subrayado |
| `.cdl-nav-item` | Estado seleccionado (ver abajo) |
| `.cdl-glow` | Iconos y redes: halo que crece detrás del glifo |
| `.cdl-press` | Clic: `scale: 0.97` en 160 ms |
| `[data-ripple]` | Onda de luz en el punto exacto del clic |
| `[data-magnetic]` | El elemento se inclina hacia el puntero; máximo uno o dos por vista |

- Todo hover está condicionado a `(hover: hover) and (pointer: fine)`: en un
  teléfono un toque nunca deja un resaltado pegado.
- El foco de teclado recibe la misma luz, centrada.
- Movimiento reducido conserva la luz (es color, no desplazamiento) y quita la
  onda, el magnetismo y el barrido del brillo.
- Escala de z-index: subnavegación fija 30, cabecera 40, pantalla de carga 100.

### Estado seleccionado (sin subrayado)

Por pedido del equipo, **nada en el sitio se subraya** para marcar dónde estás.
El elemento actual o seleccionado cambia a dorado y su texto **brilla**: un
halo de la misma luz dorada alrededor de los glifos (`text-shadow`), que se
enciende con un destello corto y se asienta. Es luz, no profundidad, así que
es la segunda excepción a la regla de "sin sombras", junto a `.halo-brand`.

- Una sola regla: `.cdl-nav-item` en `app/globals.css`. Se activa con
  `aria-current`, `aria-selected="true"` o `aria-pressed="true"`, así el
  estado visual nunca se separa de lo que anuncia el lector de pantalla.
  `.cdl-current` es el gancho explícito cuando no hay atributo ARIA (el
  idioma activo del selector).
- El color de reposo sale de `--cdl-nav-color` (por defecto, texto atenuado),
  para que una superficie lo cambie sin que una utilidad de Tailwind pise el
  dorado del seleccionado.
- En `.on-paper` el brillo usa Dorado 300 (`--cdl-glow-rgb`).
- Lo usan: la barra de navegación, el menú móvil, las columnas del pie, las
  pestañas del destacado de la Bitácora, el selector de idioma y la lista de
  partes del modelo 3D.

### Navegación: un solo componente

[`components/ui/nav-link.tsx`](../components/ui/nav-link.tsx) (`NavLink`) es el
enlace de todos los menús. Resuelve en un único lugar:

- **Página actual**: `aria-current="page"`, también en sus subpáginas
  (`/publications/x` deja "Bitácora" encendida).
- **Clic pendiente**: casi todas las páginas se renderizan por petición, y la
  respuesta podía tardar casi un segundo sin ninguna señal, así que la gente
  hacía clic dos veces. Ahora la etiqueta pulsa la misma luz dorada desde el
  clic hasta que llega la página (`useLinkStatus`), y
  [`app/loading.tsx`](../app/loading.tsx) hace que la navegación se confirme
  de inmediato con un esqueleto y una línea de luz bajo la cabecera.
  Medido en desarrollo: de 140–880 ms sin respuesta visible a 40–200 ms.

### Pantalla de carga

[`components/motion/site-loader.tsx`](../components/motion/site-loader.tsx),
adaptación del "Masthead Reveal" a la marca. Dura lo suficiente para leerse
(pedido del equipo) y carga los detalles de la marca:

- el isotipo dentro de dos anillos: el dorado de progreso real y siete arcos
  en los colores de las áreas que se dibujan uno a uno hasta cerrar el
  círculo ("Ciclo": siete áreas, un solo ciclo);
- CANDELARIA letra a letra y, debajo, SOLAR CAR en dorado, como el lockup;
- los tres atributos del isotipo (Ciclo, Facetas, Dirección), uno a la vez,
  junto al contador;
- los cuatro valores y la línea institucional al pie;
- de fondo, una retícula tenue de celdas solares que cruza una banda de luz.

El isotipo nunca se ilumina ni brilla (manual §2.6): solo se mueven los
anillos y la tipografía.

- La entrada es CSS, así que se ve completa aunque el JavaScript aún no haya
  llegado. El progreso y la salida sí son script.
- El progreso real combina el estado del documento y lo que registran los
  componentes pesados en [`lib/load-progress.ts`](../lib/load-progress.ts)
  (hoy, los fotogramas del hero).
- Dura como mínimo 5,2 s desde la navegación (más ~1,1 s de salida) y espera
  los recursos como máximo 7 s. Con movimiento reducido, 0,6 s.
- Una vez por sesión (`sessionStorage`); en las siguientes navegaciones solo un
  fundido de 260 ms.
- Salvavidas: `<noscript>` la oculta, y una animación CSS la retira a los 12 s
  pase lo que pase.
- La coreografía de entrada de la página (`[data-intro]`, `--i` para el
  escalonado) solo oculta elementos mientras `html[data-intro="pending"]`.

### Hero de la portada: secuencia de fotogramas

[`components/home/hero-scrub.tsx`](../components/home/hero-scrub.tsx) recorre
el vídeo `CarHero.mp4` con el scroll, en ambos sentidos. No es un `<video>`:
reproducir un vídeo hacia atrás con `currentTime` salta y se congela; una
secuencia de imágenes pintada en `<canvas>` responde fotograma a fotograma.

- 97 fotogramas AVIF en `public/hero/v1/lg` (1600 px, ~3,8 MB) y
  `public/hero/v1/sm` (960 px, ~2,0 MB). Póster AVIF + WebP de respaldo.
- La carpeta está versionada (`v1`) porque se sirve con caché `immutable`: un
  vídeo nuevo va en `v2`, nunca sobrescribiendo `v1`.
- [`lib/frame-sequence.ts`](../lib/frame-sequence.ts) descarga primero 5
  fotogramas repartidos (`COARSE_FRAMES`) para que el scroll funcione cuanto
  antes, y el resto en segundo plano con prioridad baja. Solo mantiene
  decodificada una ventana alrededor de la posición actual.
- El vídeo es un **render conceptual generado**, no el carro real. La leyenda
  lo dice y debe quedarse mientras ese vídeo esté publicado.
- En vertical (teléfono) el fotograma se encuadra sobre un relleno ambiental
  del mismo vídeo con borde difuminado, en vez de recortar el carro.
- Sin AVIF, con ahorro de datos o con movimiento reducido: queda el póster
  estático y la sección mide una pantalla.

Medición (build de producción, 2026-10-14):

| Red | LCP | JS inicial | CLS | Fin de la carga |
|---|---|---|---|---|
| Rápida | ~0,6 s (póster) | 376 KB | ~0,005 | ~3 s |
| 4G lenta + CPU ×4 | ~3,0 s | 376 KB | ~0,007 | ~5,2 s |

### Equipo

- Mini hero solo de texto: título, bajada y resumen. Sin imagen.
- **Carrusel de áreas** (`components/team/team-explorer.tsx`,
  `team-ring-scene.tsx`, `ring.ts`): el "Round Carousel" de Originkit (su
  geometría, inclinación de 7°, perspectiva y arrastre con inercia), con los
  logos 3D de cada área en lugar de tarjetas. Un solo canvas para los siete.
  - Los logos miran siempre de frente, como las tarjetas del componente
    original, y viajan con el anillo. Solo el elegido sube (levita) y gira
    sobre su propio eje (0,35 rad/s); al deseleccionarlo vuelve a mirar de
    frente por el camino más corto. Los del fondo se funden con el color de
    la sección.
  - El anillo gira solo a 21°/s, la mitad de la velocidad por defecto del
    componente.
  - Elegir un área: clic en su logo, su nombre en la fila de abajo, o
    arrastrar y soltar (frena, centra el logo más cercano y lo elige). El
    logo elegido sube, su nombre aparece debajo y se abre su ficha.
  - Desde el primer arrastre o elección el anillo queda quieto. Cuando el
    puntero sale de todo el bloque (anillo y ficha), o en pantallas táctiles
    cuando el bloque sale de la vista, vuelve a girar **y se deselecciona**:
    el logo vuelve al anillo, la ficha se pliega y no queda información de
    ningún área (tampoco `?area=` en la URL). Si se pliega fuera de la vista,
    lo hace sin animación y sin mover lo que está en pantalla.
  - En el teléfono: deslizar en horizontal gira el anillo, en vertical
    desplaza la página; la fila de nombres es un carril deslizable; el
    encuadre se acerca al logo del frente para que se toque fácil.
  - Llegar con `?area=` (los enlaces "Ver el área" de Vehículo) abre esa área
    con el anillo quieto en ella. `#integrante-<id>` abre el área del
    integrante y lleva a su tarjeta.
- **Detalle del área elegida**, debajo del anillo: nombre, número de
  integrantes, resumen y acceso a su bitácora; las tres responsabilidades
  como tarjetas numeradas con la barra de su color; y los integrantes.
- **Cómo trabajamos** (`components/team/work-cycle.tsx`): un diagrama en vez
  de una lista. Las siete áreas son siete puntos de su color y cada práctica
  los reordena: alrededor de una mesa (reunión semanal), cada una cerrando su
  anillo (criterio de cierre), alimentando la bitácora del centro (todo
  queda escrito) y unidas en una estrella de siete puntas (revisión cruzada).
  Avanza solo mientras está en pantalla, se detiene con el puntero o el foco
  dentro, tiene botón de pausa (WCAG 2.2.2) y se cambia con pestañas,
  flechas del teclado o deslizando sobre el dibujo.
- Integrantes en un **anillo giratorio** (adaptación del "Round Carousel" de
  Originkit, `components/team/member-ring.tsx`):
  - gira solo a 14°/s, un tercio de la velocidad de referencia;
  - con el cursor encima se detiene, y la rueda lo gira (abajo = adelante,
    arriba = atrás) sin desplazar la página; al salir, sigue girando;
  - se arrastra con el ratón o se desliza con el dedo; un arrastre nunca
    voltea una tarjeta;
  - botón de pausa y foco de teclado (gira la tarjeta enfocada al frente),
    por WCAG 2.2.2;
  - necesita seis puestos, así que los equipos pequeños se repiten; las
    copias responden al puntero pero están fuera del lector de pantalla y del
    tabulado;
  - con menos de 3 integrantes, o con movimiento reducido, se usa el carril
    plano de siempre.
- Las tarjetas dentro del anillo son planas a propósito: Chrome pierde el
  hit-testing de contenido 3D anidado dentro de otro contexto 3D, así que la
  inclinación y el volteo de cada tarjeta viven en su propia perspectiva.
- Tarjeta: al frente foto, nombre, rol y cargo (solo líder o co-líder); al
  dorso solo los íconos de sus redes. El botón de voltear no se ve con ratón
  (clic en la mitad izquierda o derecha); aparece con el foco de teclado y en
  pantallas táctiles.

### Bitácora

- El destacado es parte de la cabecera de la página, a todo el ancho y
  encima de los filtros: la bitácora abre con su mejor entrada. Es la última
  entrada, que se alterna sola cada 8 s con la más
  leída. La barra del temporizador va arriba de cada pestaña, no debajo, para
  que no se lea como un subrayado. El temporizador es la animación CSS de la barra de progreso, así que
  pausar (cursor encima, foco dentro o botón) es solo detener esa animación.
  Con movimiento reducido no rota: se cambia con las pestañas.
- Las lecturas se cuentan en `publications.view_count`
  (migración `20261014120000_publication_views.sql`) con un beacon desde la
  página de detalle: una lectura por visitante y publicación cada 6 h, sin
  bots. Si la migración no se ha corrido, el hero muestra solo la última.
- Consola de filtros con búsqueda (atajo `/`), orden, áreas y años con conteos
  reales. Son enlaces y un formulario GET de verdad: sin JavaScript filtran
  igual.

### Nosotros

- **Identidad**: por qué un cóndor, los tres atributos del isotipo con un
  glifo dibujado cada uno, la paleta con sus proporciones del manual (§4.3),
  un cóndor por área y las dos tipografías. Los significados de los colores
  son una lectura propuesta y la página lo dice.
- **Recorrido**: línea de tiempo vertical con fechas, textos y una foto por
  hito (`content/media.ts`, `timelineMedia`). Los eventos son provisionales y
  llevan esa etiqueta. Texto e imágenes entran con CSS por scroll; la línea
  dorada y los nodos que se encienden son la única parte con script.

### Apoyo

- Hero con el sol alimentando los tres destinos del dinero (SVG, las líneas
  fluyen con CSS). Las cifras son HTML encima del dibujo para no bajar de
  16 px en un teléfono.
- Dona y leyenda que se responden: al señalar una fila, su porción sale del
  anillo y su cifra va al centro. El anillo se dibuja al entrar en pantalla.
- La membresía recomendada lleva un haz de luz que la rodea (`.cdl-beam`,
  degradado cónico, no sombra).
- La alianza se explica en cuatro pasos con una regla que se llena al bajar.

### Móvil y tableta

Revisado en 360, 390, 768, 1024 y 1180 px de ancho: sin desplazamiento
horizontal, objetivos táctiles de 44 px o más y ningún texto bajo 16 px. La
tabla del reglamento pasa a tarjetas por fila bajo `md`, y el anillo de Equipo
sangra hasta el borde de la pantalla con un desvanecido.

---

## 6. El modelo 3D

[`components/vehicle/solar-car-model.tsx`](../components/vehicle/solar-car-model.tsx)
muestra la escena de estudio del equipo tal como está en Blender, sin luces,
entorno ni fondo añadidos por el sitio.

- **De dónde sale.** `scripts/blender/export-vehicle-scene.py` arma
  `public/models/vehicle-scene-v1.glb` (~4 MB, Draco) a partir de dos
  fuentes: el carro y el banco de baterías de `CarroSolar_v2.glb` (la pintura
  del carro viene horneada en una textura; la del `.blend` es una mezcla de
  nodos que glTF no puede llevar) y todo lo demás de
  `CarroSolar_estudio.blend`: ruedas, plataforma, piso, tira LED, las cuatro
  luces, las dos cámaras y el color del mundo. El banco de baterías se pone de
  pie sobre la plataforma junto a la cola del carro (en el GLB quedaba bajo el
  piso). El script borra antes los metadatos de bibliotecas de assets, que
  incluían enlaces de descarga firmados.
- **Lo que glTF no lleva y el visor reconstruye desde el archivo.** Las luces
  de área (como `RectAreaLight`, con tamaño, potencia, color y dirección
  escritos en extras); el color del mundo (en una cúpula, para que pase por la
  misma transformación AgX que el resto); que el sol no se vea en reflejos
  (en Blender tiene "Glossy" apagado: el visor le quita el término especular
  solo en los materiales de esta escena); y la capa transparente de la
  plataforma, como un reflejo plano del carro, como en los renders.
- **Encuadre.** La cámara parte de la posición de `Camara_inicial` y gira
  hacia el carro y el banco de baterías hasta que ambos caben en el escenario,
  con el mismo ángulo horizontal que Blender (en vertical, el mismo ángulo
  pasa al alto).
- **Para cambiar la escena:** editar el `.blend`, volver a correr el script
  (el comando está en su cabecera) y, si algo se movió, ajustar las
  coordenadas de `vehicleHotspots`. Un archivo nuevo va con otro nombre
  (`vehicle-scene-v2.glb`).

**Partes clicables.** Cada parte tiene un marcador que brilla en el color de su
área (`.cdl-hotspot`). Al elegirla, los materiales correspondientes del modelo
se iluminan en ese color, la cámara gira hacia ella y se abre su ficha
técnica (superpuesta en escritorio, debajo del visor en el teléfono).

- La geometría está en `content/vehicle-specs.ts` (`vehicleHotspots`); los
  textos, en los diccionarios (`vehicle.hotspots`); las cifras salen de la
  misma ficha técnica que el resto de la página.
- Los marcadores se proyectan sobre el casco real con un rayo desde fuera, así
  que un punto aproximado basta y sobreviven a una reexportación del modelo.
- Se ocultan cuando la superficie bajo ellos mira hacia el otro lado.
- La lista de partes bajo el visor es la entrada accesible (botones con
  `aria-pressed`); los marcadores son un atajo de puntero.
- En el teléfono, deslizar en vertical sobre el visor desplaza la página
  (`touch-action: pan-y` en `.cdl-stage`); arrastrar en horizontal gira el
  carro y pellizcar acerca.
- Solo se publican las partes cuyas áreas corroboraron sus datos
  (`PUBLISHED_PARTS` y `PUBLISHED_AREAS` en `content/vehicle-specs.ts`; hoy
  arreglo solar y banco de baterías). La ficha técnica, los subsistemas, el
  reglamento y las cifras del hero de la portada siguen la misma lista. Las
  demás áreas están listas en ese archivo: se publican agregándolas a la lista.
- El motor no está modelado (el archivo trae un nodo `Motor` vacío).

Three.js nunca va en el paquete inicial: se descarga en `/vehicle` en cuanto
la página hidrata. Sin WebGL se muestra un aviso y el modelo no se descarga.

## 6b. Logos 3D de las áreas

Los logos de cada área se muestran en 3D con los GLB de Diseño (`public/models/areas/`,
copiados desde `Assets/`), en el carrusel de Equipo (ver arriba). En la portada, por
pedido del equipo, las tres áreas de la física del carro son **banners
fotográficos** ([`components/content/area-banner.tsx`](../components/content/area-banner.tsx)):
mismo tamaño siempre, foto con velo Morado 300 al 60 % bajo el texto, y al
pasar el puntero la foto se acerca, el velo se levanta, un halo del color del
área sigue al puntero, la barra de acento baja por el borde y el isotipo gira.
En el teléfono la foto se desplaza contra el marco al hacer scroll. Las fotos y
su texto alternativo viven en `content/areas.ts` (`cover`). Los GLB vienen
comprimidos con Draco; el decodificador está en `public/draco/` para no
depender de un CDN. Escala normalizada: cada logo ocupa lo mismo sin importar
las unidades del archivo. Sin WebGL, Equipo muestra solo la fila de nombres.

## 7. Qué no se hizo, a propósito

- **Ficha técnica provisional (2026-10-06).** Por decisión del equipo,
  `/vehicle#especificaciones` muestra cifras de referencia de la clase
  Challenger para Chasis, Baterías y Celdas, en `content/vehicle-specs.ts`.
  No son mediciones de Candelaria y la página lo dice con la etiqueta
  "Valores provisionales". La etiqueta desaparece sola cuando todos los
  bloques tengan `provisional: false`.
- **No se inventaron cifras técnicas en el resto del sitio.** La versión anterior mostraba telemetría
  en vivo (124.5 km/h, 98.2% de eficiencia) que no correspondía a ninguna
  medición. En su lugar hay un tablero con el estado real de cada subsistema:
  validado, en simulación o por definir.
- **No se generaron fotos del vehículo ni del equipo.** Las cuatro imágenes de
  `public/img/` son estudios de material (fibra de carbono, celda solar, celdas
  de litio, luz de taller), no representaciones del coche ni del taller.

---

## 8. Páginas

Se conservaron todas las rutas de la versión anterior y su propósito. El
contenido es nuevo por completo.

| Ruta | Para qué sirve |
|---|---|
| `/` | Hero con la secuencia de fotogramas recorrida por scroll (ruta y tres cifras provisionales), tres pilares, franja de las tres áreas que definen la física del carro con logos 3D, bitácora y llamada a apoyar |
| `/vehicle` | Modelo 3D, ficha técnica provisional, cinco subsistemas (objetivo, desafío, estado y avance provisional) y matriz de cumplimiento del reglamento calculada desde la ficha |
| `/team` | Mini hero con foto del equipo, acordeón de áreas (`?area=`) con logo 3D y funciones a su lado, anillo giratorio de tarjetas por integrante (redes al dorso), cómo trabajamos y preguntas frecuentes |
| `/publications` · `/publications/[slug]` | Mini hero que alterna la última entrada y la más leída, consola de filtros (búsqueda, orden, área y año con conteos); tarjetas en papel con PDF y enlace al autor en Equipo |
| `/about` | Origen, misión y visión, construcción de la identidad (cóndor, atributos, paleta, áreas, tipografías), línea de tiempo con fotos por hito, código de cultura y cifras contadas desde la base de datos |
| `/support` | Hero con el flujo de energía, destino del dinero en dona interactiva (distribución provisional), membresías para personas y alianza para empresas en cuatro pasos. Una membresía no da pertenencia al semillero |
| `/contact` | Rutas que responden lo más común y formulario de contacto |
| `/purchases` | Historial de membresías |
| `/profile` | Datos de la cuenta, nivel de apoyo y, para integrantes, la tarjeta pública de Equipo |
| `/dashboard` | Panel interno: publicar y gestionar el área |
| `/login` · `/register` · `/forgot-password` · `/reset-password` | Acceso |
| `/privacy` · `/terms` | Legal |

No hay página ni enlace para unirse al semillero: la vinculación se lleva por un
canal y un proceso propios, fuera del sitio. Tampoco hay sección de
competencias por ahora.
