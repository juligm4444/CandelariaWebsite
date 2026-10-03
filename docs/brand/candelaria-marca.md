# Candelaria Solar Car — Especificación de marca

Archivo de referencia para generar productos digitales (web, app, piezas de redes, presentaciones, documentos) con la identidad de Candelaria Solar Car.
Fuente: archivo de Figma **Basics**, página **Manual de Marca**, sección *Manual de Marca v1.0 — Candelaria Solar Car* (19 láminas).

- Figma: https://www.figma.com/design/xBYvnAWVuBbFpacRgMcmHr/Basics?node-id=50-10
- Componentes publicados en la sección *Componentes de marca (logos, lockups, iconos)* del mismo archivo.
- Regla de oro: si algo no está en este archivo, se consulta con el área de Diseño antes de publicarlo.

---

## 1. Marca

| Campo | Valor |
|---|---|
| Nombre | Candelaria Solar Car |
| Qué es | Semillero de investigación interdisciplinario que diseña, construye y gestiona un vehículo solar |
| Símbolo | Cóndor que se envuelve sobre sí mismo hasta cerrar un círculo |
| Web | candelaria.website |

**Atributos del isotipo** (usar como guía narrativa, no como copy literal):

- Ciclo — la forma circular expresa energía que no se detiene.
- Facetas — los planos de las plumas remiten a la precisión técnica y a las celdas solares.
- Dirección — la mirada al frente comunica ambición y avance.

**Valores:** Innovación · Interdisciplina · Energía limpia · Rigor.

### Tono de voz

Equipo técnico que sabe comunicar: claro, seguro y cercano.

| Somos | No somos |
|---|---|
| Ambiciosos | Arrogantes |
| Técnicos | Herméticos |
| Colaborativos | Informales |
| Optimistas | Ingenuos |

Ejemplo correcto: «Nuestro equipo de Celdas logró mejorar la eficiencia del arreglo solar. Te contamos cómo.»
Ejemplo incorrecto: «¡¡Somos los mejores!! Resultados brutales en las celdas, nadie nos alcanza.»

Reglas de redacción: frases cortas, dato antes que adjetivo, sin signos de exclamación dobles, sin mayúsculas sostenidas fuera de etiquetas, sin emojis en documentos oficiales.

---

## 2. Logotipo

### 2.1 Configuraciones

| Configuración | Componente Figma | Proporción | Uso |
|---|---|---|---|
| Horizontal (preferente) | `Logo/Lockup/Horizontal - …` | 987 × 200 (≈4.94:1) | Default en web, documentos, encabezados |
| Vertical | `Logo/Lockup/Vertical - …` | 731 × 507 (≈1.44:1) | Formatos cuadrados o verticales |
| Isotipo solo | `Logo/Isotipo/…` | 300 × 278 (≈1.08:1) | Avatares, favicon, espacios reducidos; solo si el nombre ya aparece en el contexto |

La relación entre isotipo y texto es fija: no se recompone, no se separa, no se cambia el orden.

### 2.2 Versiones de color

| Versión | Isotipo | Texto "CANDELARIA" | Texto "SOLAR CAR" | Cuándo |
|---|---|---|---|---|
| Color sobre claro | Cóndor dorado | `#1E0A29` | `#BC8215` | Principal, fondos claros |
| Color sobre oscuro | Cóndor dorado | `#EFEEEA` | `#FFB938` | Principal, fondos oscuros |
| Monocromo morado | Silueta `#1E0A29` | `#1E0A29` | `#1E0A29` | Una tinta, fondos claros |
| Monocromo blanco | Silueta `#FFFFFF` | `#FFFFFF` | `#FFFFFF` | Una tinta, fondos oscuros |

### 2.3 Área de protección

`x = 1/4 de la altura del isotipo`. Margen libre de `x` en los cuatro lados del logotipo. Ningún texto, imagen, borde ni botón entra en esa zona.

```
areaProteccion = alturaIsotipo / 4
```

En el lockup horizontal la altura del isotipo equivale a la altura total del lockup, así que `x ≈ ancho / 4.94 / 4`.

### 2.4 Tamaño mínimo

| Configuración | Digital (ancho) | Impreso (ancho) |
|---|---|---|
| Horizontal | 200 px | 50 mm |
| Vertical | 140 px | 35 mm |
| Isotipo | 32 px | 10 mm |

### 2.5 Fondos aprobados

| Fondo | Versión del logotipo |
|---|---|
| Neutro 100 `#EFEEEA` | Color sobre claro |
| Morado profundo 300 `#1E0A29` | Color sobre oscuro |
| Morado profundo 100 `#3E1057` | Color sobre oscuro |
| Dorado 100 `#FFB938` | Monocromo morado |
| Lavanda 100 `#D4BCFA` | Monocromo morado |
| Violeta 300 `#A634DA` | Monocromo blanco |

Sobre fotografía: ubicar el logotipo en zonas uniformes y usar la versión blanca; si la imagen es compleja, aplicar un velo `#1E0A29` al 60%.

### 2.6 Prohibido

1. Deformar o estirar (escalar siempre proporcional).
2. Rotar.
3. Cambiar los colores.
4. Aplicar sombras, brillos u otros efectos.
5. Usarlo sobre fondos sin contraste.
6. Cambiar la tipografía del nombre.
7. Reorganizar los elementos.
8. Añadir contornos.

---

## 3. Sistema de áreas

Cada área usa el mismo cóndor en su color. Uso interno y piezas propias del equipo, siempre acompañado del nombre del área. Para comunicación externa se usa el isotipo institucional (dorado).

| Área | Color | Variable | Componente | Icono |
|---|---|---|---|---|
| Institucional | `#FFB938` | `Dorado/100` | `Logo/Isotipo/principal` | — |
| Baterías | `#12A03C` | `Áreas/Baterías` | `Logo/Isotipo/baterias` | `Icono/Baterías` |
| Celdas | `#4F6CF0` | `Áreas/Celdas` | `Logo/Isotipo/celdas` | `Icono/Celdas` |
| Chasis | `#AFB8BD` | `Áreas/Chasis` | `Logo/Isotipo/chasis` | `Icono/Chasis` |
| Comité | `#E8490F` | `Áreas/Comité` | `Logo/Isotipo/comite` | `Icono/Comité` |
| Diseño | `#F76BB3` | `Áreas/Diseño` | `Logo/Isotipo/diseno` | `Icono/Diseño` |
| Logística | `#1CC4DC` | `Áreas/Logística` | `Logo/Isotipo/logistica` | `Icono/Logística` |
| Recursos Humanos | `#B35CCB` | `Áreas/RRHH` | `Logo/Isotipo/rrhh` | `Icono/Recursos Humanos` |

El color de área se usa como acento (etiquetas, bordes, barras), nunca como color de fondo de toda la pieza ni como color de texto largo.

---

## 4. Color

### 4.1 Paleta

| Nombre | HEX | RGB | CMYK aprox. |
|---|---|---|---|
| Dorado 100 | `#FFB938` | 255 185 56 | 0 27 78 0 |
| Dorado 200 | `#F2A413` | 242 164 19 | 0 32 92 5 |
| Dorado 300 | `#BC8215` | 188 130 21 | 0 31 89 26 |
| Dorado texto sobre claro | `#866018` | 134 96 24 | — |
| Morado profundo 100 | `#3E1057` | 62 16 87 | 29 82 0 66 |
| Morado profundo 200 | `#2D0E3F` | 45 14 63 | 29 78 0 75 |
| Morado profundo 300 | `#1E0A29` | 30 10 41 | 27 76 0 84 |
| Violeta 100 | `#C471EA` | 196 113 234 | 16 52 0 8 |
| Violeta 200 | `#BC56EB` | 188 86 235 | 20 63 0 8 |
| Violeta 300 | `#A634DA` | 166 52 218 | 24 76 0 15 |
| Lavanda 100 | `#D4BCFA` | 212 188 250 | 15 25 0 2 |
| Lavanda 200 | `#B793F0` | 183 147 240 | 24 39 0 6 |
| Lavanda 300 | `#9B6FE2` | 155 111 226 | 31 51 0 11 |
| Neutro 100 | `#EFEEEA` | 239 238 234 | 0 0 2 6 |
| Neutro 200 | `#D5D5D2` | 213 213 210 | 0 0 1 16 |
| Neutro 300 | `#BABABA` | 186 186 186 | 0 0 0 27 |

Roles: Dorado y Morado profundo son identidad; Violeta y Lavanda acompañan; Neutro da aire.

### 4.2 Generar tonos nuevos

1. Elegir el color de la paleta más cercano al esperado y pasarlo a HSL.
2. Mover el 2.º y 3.er valor (S y L) en múltiplos de 10, ambos en la misma dirección (subir = más claro, bajar = más oscuro).
3. Si un valor ya está por encima de 90 o por debajo de 10, mover solo el valor posible, en múltiplos de 5 o de 2.

En documentos oficiales se permite blanco y negro puros. En productos (posters, afiches, reels) se usan tonos de la paleta.

### 4.3 Proporción por pieza

Morado profundo 45% · Neutro 30% · Dorado 15% · Violeta 6% · Lavanda 4%. El dorado es acento: no debe dominar.

### 4.4 Contraste (WCAG 2.2 AA mínimo: 4.5:1 texto normal, 3:1 texto grande)

| Texto | Fondo | Ratio | Nivel |
|---|---|---|---|
| `#1E0A29` | `#EFEEEA` | 16.00:1 | AAA |
| `#EFEEEA` | `#1E0A29` | 16.00:1 | AAA |
| `#FFB938` | `#1E0A29` | 10.83:1 | AAA |
| `#1E0A29` | `#FFB938` | 10.83:1 | AAA |
| `#FFFFFF` | `#3E1057` | 14.82:1 | AAA |
| `#1E0A29` | `#D4BCFA` | 10.94:1 | AAA |
| `#FFFFFF` | `#A634DA` | 5.09:1 | AA |
| `#866018` | `#EFEEEA` | 4.89:1 | AA |

No usar: `#BC8215` como texto sobre `#EFEEEA` (2.85:1). Para texto dorado sobre fondo claro usar `#866018`.

### 4.5 Tokens CSS

```css
:root{
  /* identidad */
  --cdl-dorado-100:#FFB938; --cdl-dorado-200:#F2A413; --cdl-dorado-300:#BC8215;
  --cdl-dorado-texto:#866018;
  --cdl-morado-100:#3E1057; --cdl-morado-200:#2D0E3F; --cdl-morado-300:#1E0A29;
  --cdl-violeta-100:#C471EA; --cdl-violeta-200:#BC56EB; --cdl-violeta-300:#A634DA;
  --cdl-lavanda-100:#D4BCFA; --cdl-lavanda-200:#B793F0; --cdl-lavanda-300:#9B6FE2;
  --cdl-neutro-100:#EFEEEA; --cdl-neutro-200:#D5D5D2; --cdl-neutro-300:#BABABA;
  /* áreas */
  --cdl-area-baterias:#12A03C; --cdl-area-celdas:#4F6CF0; --cdl-area-chasis:#AFB8BD;
  --cdl-area-comite:#E8490F; --cdl-area-diseno:#F76BB3; --cdl-area-logistica:#1CC4DC;
  --cdl-area-rrhh:#B35CCB;
  /* semánticos — tema claro */
  --cdl-bg:var(--cdl-neutro-100); --cdl-surface:#FFFFFF;
  --cdl-text:var(--cdl-morado-300); --cdl-text-muted:rgba(30,10,41,.7);
  --cdl-border:rgba(30,10,41,.12); --cdl-accent:var(--cdl-dorado-texto);
}
[data-theme="dark"]{
  --cdl-bg:var(--cdl-morado-300); --cdl-surface:var(--cdl-morado-200);
  --cdl-text:var(--cdl-neutro-100); --cdl-text-muted:rgba(239,238,234,.75);
  --cdl-border:rgba(239,238,234,.2); --cdl-accent:var(--cdl-dorado-100);
}
```

En fondo claro el acento de texto es `#866018`; en fondo oscuro es `#FFB938`. El `#FFB938` solo va como texto sobre morado, o como relleno de formas.

> Nota de implementación (sitio web, 2026-10): este sitio **no** implementa el
> conmutador `[data-theme]`. Se publica un único tema fijo, documentado en
> `docs/DESIGN.md`, que usa Morado profundo 300 como lienzo y Neutro 100 como
> superficie de papel para paneles e insertos. Los dos juegos de variables de
> arriba siguen siendo la referencia de contraste.

---

## 5. Tipografía

| Familia | Rol | Dónde |
|---|---|---|
| Sansation | Principal | Títulos, subtítulos, logotipo y piezas muy específicas |
| Helvetica Now | Secundaria | Textos, párrafos, documentos oficiales, plantillas formales. Nunca dentro del logotipo |

Pesos de Sansation: Regular por defecto; Light y Bold de uso específico (consultar antes).
Pesos de Helvetica Now: Light por defecto (párrafos, instrucciones); Regular para conceptos base; Medium para subtítulos de documentos oficiales; Bold para títulos de documentos oficiales; Italic única y exclusivamente para citas o referencias.

### Reglas generales

1. Altura de línea en automático.
2. Espaciado entre letras en 0% (valor por defecto).
3. Todos los tamaños de letra en múltiplos de 8.
4. Evitar el texto justificado, salvo que el formato lo exija.

### Escala (estilos de Figma)

| Estilo | Fuente | Tamaño |
|---|---|---|
| `Sansation/Display` | Sansation Bold | 160 |
| `Sansation/Título 1` | Sansation Bold | 80 |
| `Sansation/Título 2` | Sansation Regular | 56 |
| `Sansation/Subtítulo` | Sansation Regular | 32 |
| `Helvetica Now/Título doc - Bold` | Helvetica Now Bold | 40 |
| `Helvetica Now/Subtítulo doc - Medium` | Helvetica Now Medium | 24 |
| `Helvetica Now/Concepto - Regular` | Helvetica Now Regular | 24 |
| `Helvetica Now/Párrafo L - Light` | Helvetica Now Light | 24 |
| `Helvetica Now/Párrafo - Light` | Helvetica Now Light | 16 |
| `Helvetica Now/Etiqueta - Medium` | Helvetica Now Medium | 16 |
| `Helvetica Now/Cita - Italic` | Helvetica Now Light Italic | 24 |

Los tamaños anteriores corresponden a un lienzo de 1920 px. En web se escalan manteniendo los múltiplos de 8 (por ejemplo 80 → 48/40 en móvil).

### CSS tipográfico

```css
:root{
  --cdl-font-titulo:"Sansation",system-ui,sans-serif;
  --cdl-font-texto:"Helvetica Now Text","Helvetica Neue",Helvetica,Arial,sans-serif;
}
h1,h2,h3,.cdl-titulo{font-family:var(--cdl-font-titulo);letter-spacing:0;line-height:normal;}
body,p,li,.cdl-texto{font-family:var(--cdl-font-texto);font-weight:300;letter-spacing:0;}
em,blockquote{font-style:italic;} /* solo citas o referencias */
```

Si Helvetica Now no está disponible en el entorno (es una fuente licenciada, no web-open), usar la pila de respaldo anterior y no sustituirla por una fuente de aspecto distinto. En los archivos de Figma los estilos `Helvetica Now/…` están montados provisionalmente sobre Inter.

---

## 6. Iconografía

- Retícula 24 × 24 px, área segura de 2 px por lado (dibujo dentro de 20 × 20).
- Trazo 2 px, sin relleno, terminaciones y uniones redondeadas.
- Un solo color de la paleta por icono.
- Al escalar, el trazo escala en proporción (2 px a 24 → 4 px a 48).
- Set disponible: Baterías, Celdas, Chasis, Comité, Diseño, Logística, Recursos Humanos, Energía, Sol.

```css
.cdl-icono{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}
```

---

## 7. Layout y composición

Derivado de la retícula usada en las láminas del manual (lienzo 1920 × 1080):

- Margen lateral: 120 px sobre 1920 = **6.25% del ancho**. Mínimo 24 px en móvil.
- Todo el espaciado en múltiplos de 8: 8 / 16 / 24 / 32 / 40 / 56 / 72 / 120.
- Radio de esquina: 16 px en tarjetas pequeñas, 24 px en bloques grandes, 12 px en píldoras pequeñas. Logotipo y iconos nunca llevan radio.
- Línea divisoria: 1 px del color de texto al 12–16% de opacidad.
- Jerarquía por lámina/sección: etiqueta (16 Medium, mayúsculas) → título (Sansation) → párrafo de apoyo máximo 4 líneas.
- Fondos alternados claro/oscuro para separar secciones; evitar más de dos cambios de fondo seguidos.
- Sin sombras por defecto; la profundidad se resuelve con contraste de fondo. Si hace falta, un halo radial `#3E1057` sobre `#1E0A29`.

### Patrones de componente (web)

```css
.cdl-card{background:var(--cdl-surface);border:1px solid var(--cdl-border);border-radius:24px;padding:32px;}
.cdl-btn{font-family:var(--cdl-font-texto);font-weight:500;font-size:16px;border-radius:12px;padding:16px 24px;}
.cdl-btn--primario{background:var(--cdl-morado-300);color:var(--cdl-neutro-100);}
.cdl-btn--primario:hover{background:var(--cdl-morado-100);}
.cdl-btn--secundario{background:transparent;color:var(--cdl-text);border:1px solid var(--cdl-border);}
.cdl-btn--acento{background:var(--cdl-dorado-100);color:var(--cdl-morado-300);} /* 10.83:1 */
.cdl-etiqueta{font-size:16px;font-weight:500;text-transform:uppercase;color:var(--cdl-accent);}
:focus-visible{outline:2px solid var(--cdl-violeta-300);outline-offset:2px;}
```

---

## 8. Formatos y piezas tipo

| Pieza | Medidas | Notas |
|---|---|---|
| Post de redes | 1080 × 1350 px | Fondo Morado profundo 100 con halo violeta, isotipo grande recortado al borde, etiqueta de área en dorado, lockup blanco al pie |
| Historia / reel | 1080 × 1920 px | Mismas reglas; zona segura de 240 px arriba y abajo |
| Portada de presentación | 1920 × 1080 px | Fondo Neutro 100, isotipo a la derecha, título en Sansation Bold, lockup horizontal al pie |
| Lámina interior | 1920 × 1080 px | Margen 120 px, etiqueta + título + párrafo máximo de 600 px de ancho |
| Carné de integrante | 324 × 512 px (proporción ~0.63) | Cabecera morada con lockup blanco, foto circular, nombre en Sansation Bold, barra inferior con el color del área |
| Avatar / favicon | 512 px y 32 px | Isotipo sobre Morado profundo 300 |
| Documento oficial | A4 | Helvetica Now; títulos Bold 40, subtítulos Medium 24, cuerpo Light 16; logotipo horizontal en el encabezado |

---

## 9. Checklist antes de publicar

1. ¿El logotipo usa un componente oficial, sin deformar, rotar ni recolorear?
2. ¿Respeta el área de protección (x = ¼ de la altura del isotipo) y el tamaño mínimo?
3. ¿La versión del logotipo corresponde al fondo?
4. ¿Todos los colores salen de la paleta o de la regla HSL?
5. ¿Todo texto cumple 4.5:1 (o 3:1 si es grande)? ¿Nada de `#BC8215` sobre fondo claro?
6. ¿Títulos en Sansation y textos en Helvetica Now, con interlineado automático y tracking 0%?
7. ¿Todos los tamaños de letra y espaciados son múltiplos de 8?
8. ¿El dorado se mantiene como acento (≈15%) y no domina la pieza?
9. ¿El color de área aparece solo como acento y acompañado del nombre del área?
10. ¿El texto suena técnico y claro, sin exageraciones?

---

## 10. Archivos y componentes

- Logos originales (PNG 1920–2048 px, fondo transparente): `C:\Users\Julian\Downloads\LOGOS\LOGOS\` → `MainLogo.png`, `Baterias.png`, `Celdas.png`, `Chasis.png`, `Comite.png`, `Diseño.png`, `Logistica.png`, `RecursosHumanos.png`.
- Componentes en Figma: `Logo/Isotipo/*` (11), `Logo/Lockup/*` (8), `Icono/*` (9).
- Variables de color: colección *Candelaria / Color* (23 variables).
- Estilos de texto: 13 estilos (`Sansation/*`, `Helvetica Now/*`).

En este repositorio los isotipos viven en `public/brand/` ya convertidos a WebP
(512 px y 1024 px). Las tipografías Sansation están en `public/fonts/` en woff2.

## 11. Pendientes de validación con el semillero

- Textos de "Sobre Candelaria", valores, tono de voz y atributos del cóndor: redactados a partir de la información pública del semillero.
- Colores de área: tomados del color promedio de cada PNG.
- Tamaños mínimos del logotipo y valores CMYK: propuestos, sin prueba de impresión.
- Los PNG del isotipo son mapas de bits; falta una versión vectorial (SVG) para impresión grande y para web nítida.
