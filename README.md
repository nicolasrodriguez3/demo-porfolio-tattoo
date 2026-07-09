# 🖋️ Tattoo Studio — Plantilla de portfolio profesional

Demo en vivo: [tattoo.nicorodriguez.com.ar](https://tattoo.nicorodriguez.com.ar)

> ⚠️ **Sitio de demostración** — Esta es una plantilla funcional de portfolio para estudio de tatuajes.
> Querés un sitio así para tu negocio? [Contactame](https://www.nicorodriguez.com.ar).

---

## Stack

| Capa              | Tecnología                                                        |
| ----------------- | ----------------------------------------------------------------- |
| Framework         | [Astro 7](https://astro.build) (static output + server API routes) |
| CMS               | [Keystatic](https://keystatic.dev) con GitHub storage             |
| UI                | [React 19](https://react.dev) (islas interactivas)                |
| Estilos           | [Tailwind CSS v4](https://tailwindcss.com) + `@tailwindcss/vite`  |
| Tipografía        | Cormorant Garamond + Inter (Google Fonts)                         |
| Mapas             | Leaflet + OpenStreetMap                                           |
| Deploy            | Docker + Node + Traefik                                           |

---

## Características

- **Galería con filtros por estilo** — Filtrado en tiempo real sin recarga
- **Lightbox a pantalla completa** — Navegación con teclado, enfoque atrapado
- **Modo oscuro/claro** — Persiste en `localStorage`, sin flash en navegación (View Transitions)
- **CMS visual** — Keystatic integrado para editar contenido desde el navegador
- **SEO** — Open Graph, JSON-LD, sitemap, robots.txt
- **Mapa interactivo** — Ubicación del estudio con Leaflet
- **Responsive** — Mobile-first, menú hamburguesa, grillas adaptativas
- **View Transitions** — Navegación tipo SPA sin recarga de página

---

## Desarrollo local

```bash
# Clonar
git clone git@github.com:nicolasrodriguez3/demo-porfolio-tattoo.git
cd demo-porfolio-tattoo

# Instalar
corepack enable && pnpm install

# Iniciar dev server
pnpm astro dev

# Abrir
open http://localhost:4321

# Keystatic (editor visual)
open http://localhost:4321/keystatic
```

En desarrollo, Keystatic usa almacenamiento **local** (escribe archivos YAML en `src/content/`).
Para usar GitHub storage, setear:

```bash
export KEYSTATIC_GITHUB_CLIENT_ID=xxx
export KEYSTATIC_GITHUB_CLIENT_SECRET=xxx
pnpm astro dev
```

---

## Build

```bash
pnpm astro build    # genera dist/
pnpm astro preview  # previsualiza el build
```

---

## Deploy en VPS con Docker + Traefik

### Requisitos

- Docker y Docker Compose instalados
- Traefik ya corriendo con `docker network create traefik`
- DNS: `tattoo.nicorodriguez.com.ar` apuntando al VPS

### 1. GitHub OAuth App

Crear en GitHub → Settings → Developer settings → OAuth Apps → **New OAuth App**:

| Campo             | Valor                                                    |
| ----------------- | -------------------------------------------------------- |
| Application name  | Tattoo Studio CMS                                        |
| Homepage URL      | `https://tattoo.nicorodriguez.com.ar`                    |
| Callback URL      | `https://tattoo.nicorodriguez.com.ar/keystatic/oauth/callback` |

Anotar **Client ID** y **Client Secret**.

### 2. Deploy

```bash
# En el VPS, en el directorio del proyecto
git pull

# Variables de entorno (Keystatic GitHub OAuth)
export KEYSTATIC_GITHUB_CLIENT_ID=client_id_de_github
export KEYSTATIC_GITHUB_CLIENT_SECRET=client_secret_de_github

# Buildear e iniciar
docker compose build
docker compose up -d

# Ver logs
docker compose logs -f
```

La app corre en `:4321`. Traefik recibe tráfico en 80/443 y lo redirige al contenedor.

### Actualizar después de cambios

```bash
git pull
docker compose build
docker compose up -d
```

---

## Estructura del proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Header.astro     # Nav + demo notice + theme toggle
│   ├── Footer.astro     # Footer con datos del estudio
│   ├── Hero.astro       # Sección principal (home)
│   ├── GalleryGrid.astro # Grilla de galería
│   ├── GalleryFilters.tsx # Filtros por estilo (React)
│   ├── Lightbox.tsx     # Visor a pantalla completa (React)
│   ├── ThemeToggle.tsx  # Switch dark/light (React)
│   ├── ContactForm.tsx  # Formulario de contacto (React)
│   └── Map.tsx          # Mapa Leaflet (React)
├── layouts/
│   └── BaseLayout.astro # Layout global (meta, SEO, scripts)
├── pages/               # Rutas
│   ├── index.astro
│   ├── galeria.astro
│   ├── contacto.astro
│   ├── artistas/
│   │   ├── index.astro
│   │   └── [slug].astro
│   ├── 404.astro
│   └── robots.txt.ts
├── content/
│   ├── artists/         # Artistas (YAML)
│   ├── gallery/         # Obras (YAML)
│   └── settings/        # Configuración del sitio (YAML)
├── content.config.ts    # Schema de contenido
└── styles/
    └── global.css       # Tema, colores, utilidades
```

---

## Decisiones de arquitectura

| Decisión                              | Por qué                                                                               |
| ------------------------------------- | ------------------------------------------------------------------------------------ |
| `slugField: 'slug'` en Keystatic      | Keystatic requiere slugField para resolver entradas; el campo se vuelve opcional en el schema de contenido con fallback al filename (`entry.id`) |
| `@custom-variant dark` en Tailwind    | Tailwind v4 no soporta `darkMode: 'class'` de forma nativa; se declara explícitamente |
| `astro:before-swap` con `newDocument` | Para que `swapRootAttributes()` copie la clase `dark` al nuevo documento durante View Transitions |
| React solo para islas interactivas    | Lightbox, filtros, theme toggle y formulario necesitan estado interactivo; el resto es HTML estático |
| Output `static` + Node adapter        | Las páginas son prerrenderizadas; el adaptador solo existe para servir las rutas API de Keystatic |

---

## Licencia

Este proyecto es de uso libre como plantilla de referencia.
Las imágenes son de demostración (picsum.photos).
