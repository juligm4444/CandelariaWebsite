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
  la retícula de 120 px sobre 1920 del manual.
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

## 5. Movimiento

Una sola animación de entrada y un solo banda en movimiento en todo el sitio.

El revelado por scroll es **CSS puro** (`animation-timeline: view()`), y el
contenido está visible por defecto. Un revelado en JavaScript que arranca en
`opacity: 0` y espera a un observador deja la página en blanco cuando el script
falla, se bloquea o nunca llega: eso es un fallo de contenido, no una animación
que falta. Como efecto lateral, el componente no envía nada de JavaScript.

La banda de valores es la única marquesina de la web, y se detiene y se
reordena como lista bajo `prefers-reduced-motion`, por lo que su marcado lleva
texto real.

El modelo del vehículo gira despacio salvo que la persona pida movimiento
reducido.

---

## 6. El modelo 3D

[`components/vehicle/solar-car-model.tsx`](../components/vehicle/solar-car-model.tsx)
es un **estudio esquemático de la clase Challenger**, no una reconstrucción del
vehículo de Candelaria. No existe imagen de referencia del coche real, así que
nada en él afirma ser una medida. La leyenda lo dice en las dos lenguas.

Está construido solo con primitivas y perfiles extruidos, sin ningún archivo
externo: son unos pocos kilobytes de código, y se carga únicamente en la página
del vehículo. Cada pieza es un hijo con nombre del grupo raíz, para que el
modelo admita puntos interactivos más adelante.

---

## 7. Qué no se hizo, a propósito

- **No se inventaron cifras técnicas.** La versión anterior mostraba telemetría
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
| `/` | Qué es el semillero, las siete áreas, el método, lo último publicado |
| `/vehicle` | Arquitectura por subsistemas y estado de validación |
| `/team` | Las siete áreas, de qué responde cada una y quién la integra |
| `/publications` · `/publications/[slug]` | Bitácora técnica con filtros por área y año |
| `/about` | Origen, misión, visión, recorrido y valores |
| `/support` | Membresías |
| `/purchases` | Historial de membresías |
| `/profile` | Datos de la cuenta y nivel de apoyo |
| `/dashboard` | Panel interno: publicar y gestionar el área |
| `/login` · `/register` · `/forgot-password` · `/reset-password` | Acceso |
| `/contact` · `/privacy` · `/terms` | Contacto y legal (nuevas) |
