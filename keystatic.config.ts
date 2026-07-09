import { config, fields, collection, singleton } from '@keystatic/core';

const isProduction = import.meta.env.MODE === 'production';

const storage = isProduction
  ? ({
      kind: 'github',
      repo: {
        owner: process.env.KEYSTATIC_REPO_OWNER || import.meta.env.KEYSTATIC_REPO_OWNER || 'nicolasrodriguez3',
        name: process.env.KEYSTATIC_REPO_NAME || import.meta.env.KEYSTATIC_REPO_NAME || 'demo-porfolio-tattoo',
      },
    } as const)
  : ({
      kind: 'local',
    } as const);

export default config({
  storage,
  collections: {
    artists: collection({
      label: 'Artistas',
      slugField: 'slug',
      path: 'src/content/artists/*',
      format: 'yaml',
      schema: {
        name: fields.text({ label: 'Nombre', validation: { isRequired: true } }),
        slug: fields.text({ label: 'Slug (URL)', validation: { isRequired: true } }),
        photo: fields.text({ label: 'Ruta de foto' }),
        bio: fields.text({ label: 'Biografía', multiline: true }),
        styles: fields.array(
          fields.text({ label: 'Estilo' }),
          { label: 'Estilos', itemLabel: (props) => props.value }
        ),
        social: fields.object({
          instagram: fields.text({ label: 'Instagram' }),
          email: fields.text({ label: 'Email' }),
        }, { label: 'Redes sociales' }),
        portfolioImages: fields.array(
          fields.text({ label: 'URL de imagen' }),
          { label: 'Imágenes del portfolio', itemLabel: () => '' }
        ),
        published: fields.checkbox({ label: 'Publicado', defaultValue: true }),
      },
    }),
    gallery: collection({
      label: 'Galería',
      slugField: 'slug',
      path: 'src/content/gallery/*',
      format: 'yaml',
      schema: {
        title: fields.text({ label: 'Título', validation: { isRequired: true } }),
        slug: fields.text({ label: 'Slug (URL)', validation: { isRequired: true } }),
        image: fields.text({ label: 'Ruta de imagen' }),
        description: fields.text({ label: 'Descripción', multiline: true }),
        styles: fields.array(
          fields.text({ label: 'Estilo' }),
          { label: 'Estilos', itemLabel: (props) => props.value }
        ),
        artist: fields.text({ label: 'Artista (slug)' }),
        width: fields.number({ label: 'Ancho (px)' }),
        height: fields.number({ label: 'Alto (px)' }),
        featured: fields.checkbox({ label: 'Destacado', defaultValue: false }),
        published: fields.checkbox({ label: 'Publicado', defaultValue: true }),
      },
    }),
  },
  singletons: {
    siteSettings: singleton({
      label: 'Configuración del sitio',
      path: 'src/content/settings/',
      format: 'yaml',
      schema: {
        studioName: fields.text({ label: 'Nombre del estudio', validation: { isRequired: true } }),
        address: fields.text({ label: 'Dirección', validation: { isRequired: true } }),
        phone: fields.text({ label: 'Teléfono' }),
        email: fields.text({ label: 'Email', validation: { isRequired: true } }),
        socialLinks: fields.object({
          instagram: fields.text({ label: 'Instagram' }),
          facebook: fields.text({ label: 'Facebook' }),
        }, { label: 'Redes sociales' }),
        homeHeroTitle: fields.text({ label: 'Título del hero' }),
        homeHeroDescription: fields.text({ label: 'Descripción del hero', multiline: true }),
        schedule: fields.text({ label: 'Horarios', multiline: true }),
      },
    }),
  },
});
