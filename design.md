# Design System: Neon Velocity - PRD

**Project ID:** 7241625568378350387
**Source Screens:**

- 2fd32bc3e9e64b74b4ca682bdcde9dd0 (Vehiculo - Final)
- cd8911a9217c4d878e0852b939e31678 (Inicio - Final)
- 6b299074e86e485ea93afbf9e041a02f (Equipos - Final)
- bff81a54c1e747c8a17f849baa8b72a7 (Publicaciones - Final)
- a5453e12649f41308367fafa8ff11b98 (Soporte - Final)
- c2f655fb025b4140b2f87b82aa815444 (Nosotros - Final)

## 1. Visual Theme and Atmosphere

The visual identity is a cinematic, high-contrast "neon-tech" aesthetic that blends motorsport telemetry with editorial storytelling. Across all Final screens, the system uses dark, space-like surfaces with luminous cyan and violet accents to signal performance, innovation, and momentum.

The mood is:

- Futuristic and energetic, with bold hero messaging and metric-driven sections.
- Premium but accessible, using large readable blocks and clear section rhythm.
- Technical yet human, balancing telemetry widgets and engineering narratives with community pages (team, support, publications, mission).

The composition style favors long-form scrolling pages with a strong section cadence: hero, data/feature block, themed content grids, and a consistent institutional footer.

## 2. Color Palette and Roles

The project theme indicates a custom accent color and dark mode direction:

- Core neon accent from project theme: Electric Violet (#9B55F6)

From the Final screens and their HTML content patterns, the functional palette is:

- Deep Space Black (#0A0A0A to #111111 range): Primary page backgrounds and high-contrast section foundations.
- Graphite Night (#1A1A1A to #222222 range): Elevated surfaces such as cards, nav bars, and panel containers.
- Electric Violet (#9B55F6): Primary action and key identity accent (CTA emphasis, highlights, active states).
- Plasma Cyan (#00E5FF to #22D3EE range): Data/telemetry emphasis, technical icon accents, and secondary action attention points.
- Soft Light Gray (#D1D5DB to #E5E7EB range): Body copy on dark backgrounds, supporting readability without pure white glare.
- Signal White (#F8FAFC to #FFFFFF): Headlines, key metrics, and high-priority labels.
- Success Neon Green (#22C55E range): Positive status signals, confirmations, and completed milestone indicators.

Usage strategy:

- Keep one dominant dark surface family.
- Use violet for brand-led interaction intent.
- Use cyan for technical context and live-data style moments.
- Reserve green for semantic success only.

## 3. Typography Rules

Theme metadata indicates Space Grotesk as the brand type voice, and the Final screens reflect a modern geometric sans hierarchy.

Typography model:

- Primary family: Space Grotesk (or closest geometric sans fallback).
- Display headlines: Heavy and compact, used for hero statements and section openers.
- Section headings: Semi-bold, high contrast, slightly tighter tracking.
- Body text: Regular to medium weight, generous line height for long storytelling blocks.
- Data labels and UI microcopy: Medium weight with slightly increased letter spacing for technical clarity.

Tone and hierarchy:

- Headlines use short, high-impact phrasing.
- Supporting paragraphs are concise and explanatory.
- Data-heavy modules use compact labels plus large numeric values.

## 4. Component Stylings

### Buttons

- Shape: Generously rounded rectangles to soft pill forms (matching ROUND_TWELVE intent).
- Primary buttons: Electric Violet fill with high-contrast text.
- Secondary buttons: Dark/transparent base with luminous border or subtle glow.
- Motion: Short, confident hover transitions with slight lift or glow increase.

### Cards and Containers

- Shape: Softly rounded corners, not fully circular, with modern panel geometry.
- Background: Graphite Night or translucent dark overlays on deep black sections.
- Elevation: Gentle glow or diffused shadow rather than hard drop shadows.
- Borders: Thin, low-contrast strokes to separate surfaces in dark mode.

### Inputs and Forms

- Style: Dark filled fields with clear focus rings in violet or cyan.
- Border behavior: Neutral stroke at rest, brighter accent on focus.
- CTA pairing: Input groups often end in a strong primary button for conversion actions.

### Navigation and Footer

- Navigation: Persistent top-level links across Final screens for section continuity.
- Footer: Institutional identity plus social/community links, consistently reused.

### Content Modules

- Telemetry/Data modules: Metric-first cards with iconography and status language.
- Team modules: Member cards with role labels and profile images.
- Publications modules: Filter/category controls and article cards with metadata.
- Support modules: Membership/pricing cards, donation input, and merchandise blocks.

## 5. Layout Principles

### Spatial rhythm

- Long-form vertical flow with clear sectional chapters.
- Larger vertical spacing around hero, mission, and CTA bands.
- Medium spacing inside cards and between repeated modules.

### Grid behavior

- Desktop-first wide canvas (2560 reference width in Final screens).
- Multi-column blocks for departments, cards, and plans.
- Predictable collapse strategy for narrower viewports: stacked cards and preserved hierarchy.

### Alignment and density

- Strong left alignment for readability in narrative sections.
- Centered highlight zones for hero statements and conversion prompts.
- Balanced density: technical sections are compact; narrative sections breathe more.

## 6. Interaction and Motion Guidance

- Use meaningful motion only for hierarchy and feedback.
- Hover states should intensify accent glow rather than radically changing layout.
- Keep transitions brisk to preserve performance feel.

## 7. Voice and Content Tone

Across the six Final screens, copy style is:

- Ambitious and future-facing.
- Technical but understandable.
- Community-driven, with institutional credibility and mission framing.

Use short declarative headlines, supported by concise explanatory text and concrete metrics or milestones.

## 8. Reuse Checklist for New Screens

When creating a new screen in this system:

- Start with a dark foundation and one dominant accent (violet) plus one technical accent (cyan).
- Apply soft rounded geometry consistently across controls and cards.
- Keep navigation and footer patterns structurally compatible with existing screens.
- Use a hero section, one data/story module, and one trust/community module.
- Preserve the same typography voice: geometric, modern, and high-contrast.
- Keep semantic colors strict: green for success, not general decoration.
