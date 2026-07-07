# Design: carmin-tattoo-portfolio

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   Build Time (CI/CD)                │
│  ┌──────────┐   git push   ┌──────────────────────┐ │
│  │ Keystatic │ ──────────→ │  Cloudflare Pages    │ │
│  │ Admin UI  │   content   │  (Astro build)       │ │
│  │ (dev)     │   commits   │                      │ │
│  └──────────┘             │  astro build          │ │
│                            │    ↓                  │ │
│                            │  static .html/.css    │ │
│                            │  ─────────────────→  │ │
│                            │  Cloudflare CDN       │ │
│                            └──────────────────────┘ │
└─────────────────────────────────────────────────────┘
                              │
┌──────────────────────────────▼──────────────────────┐
│                   Runtime (Browser)                 │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │  Astro pages (zero JS by default)           │    │
│  │                                             │    │
│  │  Islands (interactive):                     │    │
│  │  ├── ThemeToggle     (React, 0.5KB)         │    │
│  │  ├── GalleryFilters  (React, 1.2KB)         │    │
│  │  ├── Lightbox        (React, 3KB)           │    │
│  │  ├── ContactForm     (React, 2KB)           │    │
│  │  └── Map             (React, 8KB Leaflet)   │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

**Flujo build-time**: Keystatic escribe archivos YAML/MD en `src/content/` → Astro lee con `astro:content` → genera HTML estático → Cloudflare Pages sirve desde CDN.

**Flujo runtime**: Solo las islas React hidratan en cliente. El lightbox usa View Transitions API (navegación SPA-like sin framework). El formulario POSTea a Web3Forms vía fetch.

**Decisión clave**: CMS condicional — Keystatic solo corre en dev. En build de producción, el contenido ya está committeado en `src/content/` y se lee estáticamente. No hay server runtime, no hay base de datos, no hay backend.

---

## Component Tree

```
BaseLayout.astro (layout shell, SEO meta, fonts, View Transitions)
├── Header.astro (static — nav links, ThemeToggle island)
│   └── ThemeToggle.tsx      ← ISLAND (React, client:visible)
├── <slot/> (page content)
│
│   ── index.astro
│   │   └── Hero.astro (static)
│   │
│   ── galeria.astro
│   │   ├── GalleryFilters.tsx  ← ISLAND (React, client:visible)
│   │   └── GalleryGrid.astro (static — renderiza grid)
│   │       └── Lightbox.tsx    ← ISLAND (React, client:visible)
│   │
│   ── artistas/index.astro
│   │   └── ArtistCard.astro (static)
│   │
│   ── artistas/[slug].astro (static — generateStaticParams)
│   │   └── Lightbox.tsx        ← ISLAND (React, client:visible)
│   │
│   ── contacto.astro
│   │   ├── ContactForm.tsx     ← ISLAND (React, client:visible)
│   │   └── Map.tsx             ← ISLAND (React, client:visible)
│   │
│   └── 404.astro (static)
│
└── Footer.astro (static)
    └── SocialLinks.astro (static)
```

**Islas (componentes con JS)**: 5 islands React. El resto es HTML estático que Astro renderiza en build. Estrategia `client:visible` para todas las islands (cargan cuando el elemento entra al viewport), salvo `ThemeToggle` que usa `client:load` por el inline script de dark mode.

---

## Data Flow

### Content Collections — Schemas

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const artists = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    photo: z.string(),           // ruta a imagen
    bio: z.string(),             // HTML desde Keystatic rich text
    styles: z.array(z.string()), // ej: ["tradicional", "blackwork"]
    social: z.object({
      instagram: z.string().optional(),
      email: z.string().optional(),
    }).optional(),
    portfolioImages: z.array(z.string()).optional(), // refs a gallery slugs
    published: z.boolean().default(true),
  }),
});

const gallery = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    image: z.string(),           // ruta a imagen
    description: z.string().optional(),
    styles: z.array(z.string()), // tags de estilo
    artist: z.string(),          // ref al slug del artista
    width: z.number().optional(),// para masonry sin layout shift
    height: z.number().optional(),
    published: z.boolean().default(true),
  }),
});

const siteSettings = defineCollection({
  type: 'data',
  schema: z.object({
    studioName: z.string(),
    address: z.string(),
    phone: z.string().optional(),
    email: z.string(),
    socialLinks: z.object({
      instagram: z.string().optional(),
      facebook: z.string().optional(),
    }),
    homeHeroTitle: z.string(),
    homeHeroDescription: z.string(),
  }),
});
```

### CMS Flow: Keystatic → Content → Build

```
Keystatic Admin (dev)           Build (CI/CD)
       │                             │
       │ escribe                      │ lee
       ▼                             ▼
  src/content/ ──── git push ───→ astro:content collections
  ├── artists/lautaro.yaml             │
  ├── gallery/dragon-sleeve.yaml       │ genera páginas
  └── settings/studio.yaml             ▼
                                  static HTML → CDN
```

### Galería: Relación artists ↔ gallery

La relación es unidireccional: `gallery.artist` es un string que matchea `artists.slug`. En build, Astro cruza ambas collections para armar la página de cada artista con sus imágenes de portfolio. No hay foreign keys — es un lookup en build time.

### Contact Form: Submit Flow

```
Usuario → ContactForm.tsx
            │
            ├─ valida client-side (name, email, message)
            ├─ chequea honeypot (campo oculto)
            ├─ chequea rate limit (localStorage timestamp)
            │
            ├─ POST https://api.web3forms.com/submit
            │   ├─ access_key + form data
            │   └─ headers: Content-Type application/json
            │
            ├─ success → show "Mensaje enviado con éxito" + reset
            └─ error → show "Error al enviar. Intenta de nuevo."
```

---

## Route Design

| Route | Type | View Transition | Notes |
|-------|------|-----------------|-------|
| `/` | Static | fade | Hero + preview gallery |
| `/galeria` | Static | fade | Masonry grid + filters |
| `/artistas` | Static | fade | Artist cards grid |
| `/artistas/[slug]` | Static (dynamic) | fade | `getStaticPaths()` desde `artists` collection |
| `/contacto` | Static | fade | Form + map side-by-side |
| `/404` | Static | — | Custom 404 |
| `/robots.txt` | Static (generated) | — | `robots.txt.ts` endpoint |

**View Transitions**: Todas las navegaciones entre páginas usan `<ViewTransitions />` de Astro con transición `fade` por defecto. El lightbox usa `document.startViewTransition` con `view-transition-name` en la imagen target para animación de scale/crossfade.

---

## Design Decisions

### ADR-001: Keystatic como CMS

| Opción | Tradeoff | Decisión |
|--------|----------|----------|
| **Keystatic** | Astro-native, git-based, free 3 users, condicional build | ✅ Elegido |
| Decap CMS | Requiere Netlify o gateway externo | ❌ |
| TinaCMS | Cloud tier limitado, self-hosted complejo | ❌ |
| Strapi | Requiere servidor Node, overkill para portfolio | ❌ |

**Consecuencia**: Admin solo en dev. Producción sirve contenido estático sin depender de un CMS runtime.

### ADR-002: Cloudflare Pages como hosting

| Opción | Tradeoff | Decisión |
|--------|----------|----------|
| **Cloudflare Pages** | CDN global, ancho de banda ilimitado gratis, 500 builds/mes | ✅ Elegido |
| Vercel | 100GB ancho banda gratis, menos CDN edges en LATAM | ❌ |
| Netlify | 100GB ancho banda gratis, builds limitados | ❌ |

**Consecuencia**: Mejor rendimiento para Argentina por edges de Cloudflare en Buenos Aires y San Pablo.

### ADR-003: Tailwind v4 con Vite plugin

| Opción | Tradeoff | Decisión |
|--------|----------|----------|
| **Tailwind v4** | Zero config, Vite plugin nativo, `@import` en CSS | ✅ Elegido |
| CSS Modules | Más boilerplate, sin utility-first | ❌ |
| Vanilla Extract | Type-safe, pero más setup para un proyecto chico | ❌ |

**Consecuencia**: Sin archivo `tailwind.config.js` — los tokens van en `global.css` con `@theme`.

### ADR-004: Lightbox custom con View Transitions

| Opción | Tradeoff | Decisión |
|--------|----------|----------|
| **Custom con VT API** | ~3KB, animaciones nativas, sin dependencias extra | ✅ Elegido |
| Fancybox | 30KB+, licencia comercial, no usa VT API | ❌ |
| PhotoSwipe | 20KB+, excelente pero overkill | ❌ |

**Consecuencia**: El lightbox es una isla React de ~3KB. Si el browser no soporta `startViewTransition`, cae a fade CSS.

### ADR-005: Masonry grid en CSS puro

| Opción | Tradeoff | Decisión |
|--------|----------|----------|
| **CSS columns** | Sin JS, sin layout shift, funciona sin JS | ✅ Elegido |
| Masonry JS lib (e.g. Masonry.js) | 10KB+, más JS, posible layout shift | ❌ |
| CSS Grid subgrid | Soporte parcial en navegadores (2026) | ❌ |

**Consecuencia**: `column-count` con `break-inside: avoid`. Imágenes con `aspect-ratio` inline para evitar CLS. El re-flow al filtrar lo maneja un pequeño JS en GalleryFilters.

### ADR-006: Web3Forms vs alternativas

| Opción | Tradeoff | Decisión |
|--------|----------|----------|
| **Web3Forms** | Ilimitado gratis, sin servidor propio, honeypot incluido | ✅ Elegido |
| Formspree | 50/mes gratis, después pago | ❌ |
| Netlify Forms | 100/mes gratis, requiere Netlify hosting | ❌ |
| FormSubmit | Gratis pero sin control de spam | ❌ |

**Consecuencia**: El form POSTea directo a Web3Forms desde el cliente. Añadimos honeypot y rate limit client-side como defensa adicional.

---

## Performance & SEO

### Imágenes

- **Formato**: Keystatic sube como sube (JPEG/PNG/WebP). Astro con `<Image />` o `<Picture />` para generar WebP en build.
- **Dimensiones**: Las imágenes de galería se renderizan con width/height explícitos (desde Keystatic metadata) para reservar espacio y evitar CLS.
- **Lazy loading**: `loading="lazy"` en todas las imágenes below the fold. Eager en hero image y artist photos above the fold.
- **Responsive**: `srcset` con breakpoints 400w, 800w, 1200w.

### SEO

- **Meta tags**: `BaseLayout.astro` incluye title, description, Open Graph (title, description, image, url, type:website), Twitter Cards.
- **Schema.org**: `JSON-LD` con `LocalBusiness` en homepage: name, address, telephone, image, openingHours, priceRange.
- **Sitemap**: `@astrojs/sitemap` genera `sitemap.xml` automáticamente.
- **robots.txt**: Endpoint estático que permite todo rastreo.

### Core Web Vitals Target

| Métrica | Target | Estrategia |
|---------|--------|------------|
| LCP | < 2.5s | Hero image con preload, WebP, responsive |
| FID/INP | < 100ms | Islands chicas, lazy hydration |
| CLS | < 0.05 | width/height en imágenes, sin layout shift en dark toggle |

---

## Security

| Aspecto | Implementación |
|---------|---------------|
| **Form honeypot** | Campo oculto `_gotcha` que bots llenan automáticamente — si tiene valor, se descarta sin enviar |
| **Rate limiting** | `localStorage` con timestamp del último envío — bloquea por 60s |
| **CMS auth** | Keystatic Cloud autentica con GitHub OAuth. No expuesto en producción |
| **CSP headers** | Cloudflare Pages soporta headers custom via `_headers` file. Content-Security-Policy restrictivo (solo scripts propios, Leaflet CDN, Web3Forms) |
| **XSS** | Astro escapa todo output por defecto. Web3Forms sanitiza en servidor |
| **HTTPS** | Cloudflare Pages forza HTTPS por defecto |
| **Form data** | Sin almacenamiento local — POST directo a Web3Forms sobre HTTPS |
