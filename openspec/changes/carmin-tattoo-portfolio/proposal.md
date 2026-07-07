# Proposal: carmin-tattoo-portfolio

## Intent

Static portfolio site for Carmin Tattoo Studio (Paraná, Argentina) with a git-based CMS so the studio manages their gallery, artist profiles, and contact info without writing code.

## Scope

### In Scope
- Public pages: Home, Gallery (with style filters), Artist profiles, Contact with map
- Admin panel via Keystatic for content management
- Dark editorial design with copper accent (#B87333)
- Lightbox using View Transitions API
- Contact form via Web3Forms
- Location map via Leaflet (OpenStreetMap tiles)
- Responsive, mobile-first layout
- Cloudflare Pages deployment

### Out of Scope
- Booking/scheduling system (manual contact only)
- E-commerce or online payments
- Multi-language (Spanish only for v1)
- User accounts or auth beyond Keystatic admin
- Blog or news section
- Analytics, SEO tooling (post-launch)
- Performance optimization beyond Astro defaults

## User Stories

- Como administrador del estudio quiero subir fotos de tatuajes desde un panel para mantener la galería actualizada sin saber programar
- Como visitante quiero filtrar la galería por estilo para encontrar el tipo de trabajo que me interesa
- Como cliente potencial quiero ver el perfil de cada artista para decidir con quién tatuarme
- Como dueño del estudio quiero que los clientes puedan contactarnos fácilmente para pedir turnos
- Como visitante quiero ver las fotos en detalle con un lightbox para apreciar el trabajo del estudio

## Capabilities

### New Capabilities
- `cms-admin`: Keystatic CMS for gallery, artist profiles, and site content
- `gallery-browsing`: Public gallery with style filtering, masonry grid, lightbox
- `artist-directory`: Artist profiles with bio, portfolio images, contact info
- `contact-form`: Contact page with Web3Forms and Leaflet map

### Modified Capabilities
None — greenfield project.

## Approach

Astro + Keystatic (git-based CMS, Astro-native, free for 3 users). Content rendered at build time via `astro:content` collections. Dark editorial design with Tailwind: bg #0A0A0A, accent copper #B87333, text #F5F0EB. Typography: Cormorant Garamond (headings) + Inter (body). Keystatic runs in admin UI in dev, static content in production. View Transitions API for lightbox and page navigation. Deploy on Cloudflare Pages free tier.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/pages/` | New | Home, gallery, artists, contact routes |
| `src/components/` | New | Lightbox, gallery grid, artist card, contact form, map |
| `src/content/` | New | Keystatic collections config and content schemas |
| `src/layouts/` | New | Base layout, nav, footer, dark mode toggle |
| `keystatic.config.*` | New | CMS admin panel configuration |
| `astro.config.*` | New | Astro project and integration config |
| `tailwind.config.*` | New | Design tokens and theme extensions |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Keystatic is build-time only — no draft preview on prod | Medium | Conditional mode: admin UI in dev, static content in build |
| Cloudflare Pages build limit (500 builds/mo free) | Low | Production builds on merge only; preview on branches |
| Web3Forms rate limits under traffic | Low | Client-side rate limiting + honeypot; monitor post-launch |
| Leaflet tile loading without API key | Low | Default OpenStreetMap tiles with attribution; no key needed |

## Rollback Plan

Revert to previous Cloudflare Pages deployment via dashboard. Since content is git-based, revert the commit that changed content or code. Astro generates static output — no database rollback needed.

## Dependencies

- Cloudflare Pages account (free tier)
- GitHub repository (for Keystatic git-based CMS)
- Web3Forms endpoint (free tier)
- OpenStreetMap tiles (free, attribution required)
- Google Fonts: Cormorant Garamond + Inter

## Success Criteria

- [ ] All pages render correctly on desktop and mobile 320px+
- [ ] Keystatic admin panel accessible at `/keystatic` in dev mode
- [ ] Gallery images upload and display in masonry grid without gaps
- [ ] Gallery filtering by style works without full page reload
- [ ] Contact form submissions arrive via Web3Forms
- [ ] Lightbox opens/closes with animated View Transitions
- [ ] Dark mode persists across page navigation (class strategy)
- [ ] Leaflet map shows studio pin at Bavio 173, Paraná
- [ ] Cloudflare Pages deploys successfully from `main` branch
