# Tasks: carmin-tattoo-portfolio

> Greenfield Astro + Keystatic portfolio site for Carmin Tattoo Studio. Proyecto vacío — todas las tareas crean archivos nuevos.

---

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~2000+ |
| 800-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (Foundation) → PR 2 (Gallery & Lightbox) → PR 3 (Features & SEO) |
| Delivery strategy | auto-chain |
| Chain strategy | stacked-to-main |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

**Delivery decision**: `auto-chain` with `stacked-to-main` — PR 1 targets `main`, PR 2 targets `main`, PR 3 targets `main`.

### Suggested Work Units

| Unit | Goal | Likely PR | Base |
|------|------|-----------|------|
| 1 | Foundation: scaffold, schemas, layout, dark mode | ✅ PR 1 | `main` |
| 2 | Core: home, gallery, lightbox | PR 2 | `main` |
| 3 | Features: artists, contact, SEO, 404 | PR 3 | `main` |

---

## Task Groups

### TG-1: Scaffold & Tooling

| ID | Tarea | Archivos | Deps | Tamaño | Acceptance Criteria |
|-----|-------|----------|------|--------|-------------------|
| T-001 | [x] Inicializar proyecto Astro con TypeScript | `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/env.d.ts` | — | small | `astro dev` arranca sin errores, navegación en localhost |
| T-002 | [x] Integrar Tailwind v4 via PostCSS (nota: PostCSS en vez de Vite plugin por compatibilidad con Astro 6) | `postcss.config.mjs`, `src/styles/global.css` | T-001 | small | Clases Tailwind renderizan en dev, `@import "tailwindcss"` funciona |
| T-003 | [x] Agregar integraciones: ClientRouter, Sitemap | `astro.config.mjs` (update), `src/layouts/BaseLayout.astro` | T-001 | small | `<ClientRouter />` disponible, `sitemap.xml` se genera en build |
| T-004 | [x] Crear estructura de directorios | `src/pages/`, `src/components/`, `src/layouts/`, `src/content/`, `src/styles/`, `public/images/` | T-001 | small | Directorios creados, rutas consistentes con el design |
| T-005 | [x] Instalar dependencias: Keystatic, Leaflet, React | `package.json` (update) | T-001 | small | `npm install` sin errores, imports funcionan |

### TG-2: Content Collections & CMS

| ID | Tarea | Archivos | Deps | Tamaño | Acceptance Criteria |
|-----|-------|----------|------|--------|-------------------|
| T-006 | [x] Definir schemas de contenido con `astro:content` | `src/content.config.ts` | T-004 | medium | Schemas `artists`, `gallery`, `siteSettings` definidos con zod. Gallery ref a artist por slug |
| T-007 | [x] Configurar Keystatic con collections y campos | `keystatic.config.ts` | T-006 | large | Admin UI en `/keystatic` en dev, collections reflejan schemas, upload de imágenes funciona |
| T-008 | [x] Crear datos de seed (artistas, galería, settings) | `src/content/artists/`, `src/content/gallery/`, `src/content/settings/` | T-006 | medium | Astro `getCollection()` retorna datos seeded, build genera páginas con contenido |
| T-009 | [x] Configurar Keystatic condicional (dev solo, prod 404) | `astro.config.mjs` (update), `keystatic.config.ts` | T-007 | small | `/keystatic` devuelve 404 en build de producción |

### TG-3: Layout System

| ID | Tarea | Archivos | Deps | Tamaño | Acceptance Criteria |
|-----|-------|----------|------|--------|-------------------|
| T-010 | [x] Crear global CSS con tokens Tailwind v4 `@theme` | `src/styles/global.css` | T-002 | small | Tokens de color (bg #0A0A0A, accent #B87333, text #F5F0EB), typography (Cormorant, Inter), todas las páginas los heredan |
| T-011 | [x] Crear BaseLayout.astro con SEO shell, fonts, ClientRouter | `src/layouts/BaseLayout.astro` | T-010 | medium | Meta charset, viewport, fonts de Google, slot para contenido, `<ClientRouter />`, SEO meta dinámica |
| T-012 | [x] Crear Header.astro con navegación | `src/components/Header.astro` | T-011 | small | Nav: Inicio, Galería, Artistas, Contacto. Logo del estudio. ThemeToggle incluido |
| T-013 | [x] Crear Footer.astro con SocialLinks | `src/components/Footer.astro`, `src/components/SocialLinks.astro` | T-011 | small | Links sociales desde siteSettings, copyright, atribución OSM |
| T-014 | [x] Crear ThemeToggle.tsx island (React) | `src/components/ThemeToggle.tsx` | T-011 | medium | Botón sol/luna, togglea clase `dark` en `<html>`, icono refleja estado actual |
| T-015 | [x] Implementar inline script de dark mode | `src/layouts/BaseLayout.astro` (inline script) | T-010, T-014 | medium | Script bloqueante en `<head>` lee localStorage, aplica clase `dark` antes de primer paint. `client:load` en ThemeToggle |

### TG-4: Home Page

| ID | Tarea | Archivos | Deps | Tamaño | Acceptance Criteria |
|-----|-------|----------|------|--------|-------------------|
| T-016 | [x] Crear Hero.astro con título, descripción, CTA | `src/components/Hero.astro` | T-008, T-011 | small | Hero con título desde siteSettings, fondo oscuro, CTA a galería |
| T-017 | [x] Crear index.astro con preview de galería | `src/pages/index.astro` | T-016, T-008 | medium | Hero + grilla preview (últimas 6 imágenes), transición fade |

### TG-5: Gallery Page

| ID | Tarea | Archivos | Deps | Tamaño | Acceptance Criteria |
|-----|-------|----------|------|--------|-------------------|
| T-018 | [x] Crear GalleryGrid.astro con masonry CSS columns | `src/components/GalleryGrid.astro` | T-008, T-010 | medium | CSS `column-count`, `break-inside: avoid`, 1/2/3-4 cols según viewport, lazy loading, hover overlay con artista y estilo |
| T-019 | [x] Crear GalleryFilters.tsx island (React) | `src/components/GalleryFilters.tsx` | T-008, T-018 | medium | Filtros por estilo destacados visualmente, "Todos" resetea, filtrado client-side, mensaje "Sin resultados", URL refleja filtro activo |
| T-020 | [x] Crear galeria.astro como página wiring | `src/pages/galeria.astro` | T-018, T-019, T-011 | small | GalleryFilters + GalleryGrid en página, transición fade, estado vacío manejado |

### TG-6: Lightbox

| ID | Tarea | Archivos | Deps | Tamaño | Acceptance Criteria |
|-----|-------|----------|------|--------|-------------------|
| T-021 | [x] Crear Lightbox.tsx island con View Transitions API | `src/components/Lightbox.tsx` | T-008 | large | Fullscreen overlay con backdrop rgba(0,0,0,0.9), `document.startViewTransition` para apertura/cierre, navegación por teclado (arrows, Escape), foco atrapado, `role="dialog" aria-modal="true"`, counter "X de Y", fallback CSS fade si no soporta VT API |
| T-022 | [x] Wire lightbox a galería | `src/components/GalleryGrid.astro` (data-attributes), `src/components/Lightbox.tsx` (click delegation), `src/pages/galeria.astro` (wiring) | T-021 | medium | Click en imagen abre lightbox respetando filtros activos, navegación solo entre items visibles. Artistas pendiente para PR 3 |

### TG-7: Artist Pages

| ID | Tarea | Archivos | Deps | Tamaño | Acceptance Criteria |
|-----|-------|----------|------|--------|-------------------|
| T-023 | [x] Crear ArtistCard.astro | `src/components/ArtistCard.astro` | T-008, T-010 | small | Foto thumbnail, nombre, tags de estilo, link a `[slug]`, placeholder "Sin trabajos publicados" |
| T-024 | [x] Reimplementar artistas/index.astro (directorio) | `src/pages/artistas/index.astro` | T-023, T-011 | medium | Grid de ArtistCards, mensaje "Conociendo a nuestros artistas..." si vacío |
| T-025 | [x] Crear artistas/[slug].astro con `getStaticPaths` | `src/pages/artistas/[slug].astro` | T-023, T-008, T-021, T-011 | large | Bio rich text, foto grande, portfolio gallery con lightbox, contacto/social, 404 si slug no existe |

### TG-8: Contact Page

| ID | Tarea | Archivos | Deps | Tamaño | Acceptance Criteria |
|-----|-------|----------|------|--------|-------------------|
| T-026 | [x] Crear ContactForm.tsx island (React) | `src/components/ContactForm.tsx` | T-011 | large | Validación client-side (name, email, message required, email format), honeypot `_gotcha`, rate limit 60s localStorage, estados success/error/loading, POST a Web3Forms, auto-dismiss success 5s |
| T-027 | [x] Crear Map.tsx island con Leaflet | `src/components/Map.tsx` | T-011, T-005 | medium | Mapa centrado en Bavio 173, Paraná, pin con popup, atribución OSM, responsive stack abajo en mobile |
| T-028 | [x] Reimplementar contacto.astro | `src/pages/contacto.astro` | T-026, T-027, T-011 | small | Form + map side-by-side en desktop, stacked en mobile, datos de contacto desde siteSettings |

### TG-9: Dark Mode

| ID | Tarea | Archivos | Deps | Tamaño | Acceptance Criteria |
|-----|-------|----------|------|--------|-------------------|
| T-029 | [x] Diseñar variante light de todos los componentes | `src/styles/global.css` (update), `src/components/*.astro` (update), `src/pages/*.astro` (update) | T-015 | large | Cada componente tiene variante `dark:` o `light` según corresponda. Light mode: bg claro, texto oscuro, copper accent se mantiene |
| T-030 | [x] Implementar transiciones de color sin layout shift | `src/styles/global.css` (update) | T-029 | small | `transition: background-color 0.3s, color 0.3s` en elementos clave. Toggle no mueve layout |

### TG-10: SEO & Performance

| ID | Tarea | Archivos | Deps | Tamaño | Acceptance Criteria |
|-----|-------|----------|------|--------|-------------------|
| T-031 | [x] Agregar Open Graph y Twitter Cards en BaseLayout | `src/layouts/BaseLayout.astro` (update) | T-011 | small | Meta tags OG: title, description, image, url, type. Twitter card. Tags dinámicos por página |
| T-032 | [x] Agregar JSON-LD Schema.org LocalBusiness | `src/layouts/BaseLayout.astro` (update) | T-008, T-011 | small | `application/ld+json` con name, address, telephone, image, priceRange |
| T-033 | [x] Crear robots.txt.ts endpoint | `src/pages/robots.txt.ts` | T-011 | small | Permite todo rastreo, apunta a sitemap.xml |
| T-034 | [x] Configurar _headers y _redirects para Cloudflare | `public/_headers`, `public/_redirects` | T-004 | small | CSP headers restrictivos, HTTPS forced, redirects si necesarios |
| T-035 | [x] Reimplementar 404.astro personalizada | `src/pages/404.astro` | T-011 | small | Diseño consistente con marca, link a home |

---

## Resumen

| Phase | Tasks | Enfoque |
|-------|-------|---------|
| ✅ TG-1 Scaffold | 5/5 | Configuración inicial del proyecto |
| ✅ TG-2 CMS | 4/4 | Schemas y Keystatic |
| ✅ TG-3 Layout | 6/6 | Shell visual base |
| ✅ TG-4 Home | 2/2 | Página principal |
| ✅ TG-5 Gallery | 3/3 | Galería con masonry y filtros |
| ✅ TG-6 Lightbox | 2/2 | Visor de imágenes |
| ✅ TG-7 Artists | 3/3 | Directorio y perfiles |
| ✅ TG-8 Contact | 3/3 | Formulario y mapa |
| ✅ TG-9 Dark Mode | 2/2 | Tema claro y transiciones |
| ✅ TG-10 SEO | 5/5 | Meta, schema, headers |
| **Total** | **35/35** | **PR 3 completo** |

### Orden de implementación recomendado

TG-1 → TG-2 → TG-3 → TG-9 (dark mode base en layouts) → TG-4 → TG-5 + TG-6 (galería + lightbox integrados) → TG-7 → TG-8 → TG-10 → TG-9 (light polish en componentes).

TG-9 (dark mode) aparece dos veces intencionalmente: primero la base en layouts (T-014, T-015) y luego el polish visual en componentes (T-029, T-030) cuando todas las páginas existen.
