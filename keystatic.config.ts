import { config, fields, collection, singleton } from '@keystatic/core';

export default config({
  storage: {
    kind: 'local',
  },
  collections: {
    artists: collection({
      label: 'Artistas',
      slugField: 'name',
      path: 'src/content/artists/',
      format: 'yaml',
      schema: {
        name: fields.text({ label: 'Nombre', validation: { isRequired: true } }),
        slug: fields.text({ label: 'Slug (URL)', validation: { isRequired: true } }),
        igHandle: fields.text({ label: 'Instagram' }),
        photo: fields.text({ label: 'Ruta de foto' }),
        bio: fields.text({ label: 'Biografía', multiline: true }),
        specialties: fields.array(
          fields.text({ label: 'Especialidad' }),
          { label: 'Especialidades', itemLabel: (props) => props.value }
        ),
        order: fields.number({ label: 'Orden de aparición' }),
        published: fields.checkbox({ label: 'Publicado', defaultValue: true }),
      },
    }),
    gallery: collection({
      label: 'Galería',
      slugField: 'title',
      path: 'src/content/gallery/',
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
        description: fields.text({ label: 'Descripción', multiline: true }),
        address: fields.text({ label: 'Dirección', validation: { isRequired: true } }),
        phone: fields.text({ label: 'Teléfono' }),
        email: fields.text({ label: 'Email', validation: { isRequired: true } }),
        instagram: fields.text({ label: 'Instagram' }),
        schedule: fields.text({ label: 'Horarios', multiline: true }),
      },
    }),
  },
});
