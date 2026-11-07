# Aptly

## Resumen

Aplicación móvil que reúne búsqueda de empleo y gestión de candidatos. Los candidatos pueden explorar vacantes y seguir sus postulaciones. Las empresas pueden publicar vacantes y organizar candidatos por etapa.

## Qué incluye

- Flujos de registro y perfil diferenciados para candidatos y empresas.
- Explorador de vacantes, seguimiento de postulaciones y mensajería.
- Publicación de ofertas y tablero de procesos de selección con etapas.

## Guías

El [manual de usuario con capturas](Manual_Usuario.md) recorre las dos experiencias. La [documentación técnica](Documentacion_Tecnica.md) explica la navegación, las tablas, el almacenamiento y las políticas de acceso.

## Desarrollo local

Usa Expo con React Native y TypeScript. Para probar los flujos con datos, configura [lib/supabase.ts](lib/supabase.ts) con la URL y clave pública de un proyecto Supabase de pruebas.

Revisa [supabase_migration.sql](supabase_migration.sql) para preparar el esquema. [supabase_seed_data.sql](supabase_seed_data.sql) contiene datos de ejemplo para un entorno de pruebas.

```bash
npm ci
npm run start
```

El servidor de Expo permite abrir la app en un dispositivo compatible o un emulador. Para la vista web, usa `npm run web`.

## English summary

A mobile app for job searching and candidate management. Job seekers can browse openings and track applications. Employers can post openings and move candidates through hiring stages.
