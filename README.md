# 🚀 Aptly – Professional Matchmaking Platform (Obsidian Experience)

¡Bienvenido a **Aptly**! Aptly es una plataforma móvil premium de **matchmaking profesional** de última generación que revoluciona por completo la búsqueda de empleo y la gestión de talento. 

Inspirada en el diseño oscuro y glassmórfico de la estética **Obsidian**, la aplicación conecta a candidatos y empresas de forma inteligente mediante algoritmos avanzados de coincidencia (Matching), evaluaciones cognitivas técnicas lideradas por **Inteligencia Artificial** y una completa consola de seguimiento de candidatos (ATS) en tiempo real.

---

## 📚 Portales de Documentación Completa

Para explorar el proyecto en profundidad, haz clic directamente en los siguientes documentos oficiales:

*   **📖 [Manual de Usuario - Guía Visual Completa (63 Pantallas Reales)](./Manual_Usuario.md)**  
    *Una guía paso a paso ilustrada con capturas de pantalla secuenciales que cubre el registro guiado por IA, deslices de vacantes, chat interactivo y el panel Kanban empresarial.*
*   **📘 [Documentación Técnica - Arquitectura y Estructura Interna](./Documentacion_Tecnica.md)**  
    *Una inmersión profunda para ingenieros y arquitectos que describe la estructura de React Native Expo, un diagrama relacional (MER) en Mermaid, la integración de triggers en PostgreSQL y políticas RLS en Supabase.*

---

## ✨ Características y Funcionalidades Destacadas

### 1. Registro y Onboarding Asistido por IA (Candidatos)
*   **Evaluador Vocacional IA:** Acredita tus competencias resolviendo un test interactivo de 3 preguntas técnicas y situacionales. Aptly evalúa tu vocabulario y nivel cognitivo en tiempo real mediante Procesamiento de Lenguaje Natural (PLN).
*   **Rango de Acreditación IA:** Recibe una insignia técnica (*ej. Junior Acreditado IA - 62%*) y un **Reporte Cognitivo** personalizado que se expone en tu perfil para atraer reclutadores.
*   **Sectores de Interés:** Define de forma granular en qué sectores e industrias de la economía deseas enfocar tu carrera.

### 2. Consola ATS Kanban en Tiempo Real (Empresas)
*   **Pipeline Interactivo:** Administra candidatos en fases dinámicas (*Revisión, Entrevista Inicial, Selección Final*) mediante un tablero Kanban optimizado con actualizaciones optimistas en la UI (sin esperas de red).
*   **Bitácora de Reclutador:** Cuadro de notas privado por candidato visible únicamente para el equipo de selección de la empresa.
*   **Fases Personalizadas:** Posibilidad de que la empresa agregue etapas personalizadas a procesos específicos o las aplique como plantillas globales de vacantes.

### 3. Algoritmo Predictivo de Match (Swipe & Discover)
*   **Match Score Dinámico:** El sistema compara automáticamente habilidades, pretensiones salariales, modalidad y ubicación geográfica para dar un porcentaje de afinidad predictivo en cada perfil.
*   **Interacción por Deslizados:** Desliza a la derecha para postularte/preseleccionar (`APTO`), a la izquierda para descartar (`NO APTO`) o hacia arriba para enviar un `Superlike` prioritario.

### 4. Mensajería Premium en Tiempo Real (Chat Enriquecido)
*   Soporte completo para chats bidireccionales inmediatos asistidos por **Supabase Realtime**.
*   **Reply (Responder):** Desliza cualquier mensaje a la derecha para citarlo y responder en hilo.
*   **Menú Contextual:** Mantén presionado un mensaje para copiar, citar o borrar de forma local o global.
*   Soporte para emojis rápidos, reacciones y envío de imágenes desde la cámara o galería.

### 5. Sistema de Notificaciones Campanita 🔔
*   Badge dinámico de alerta en tiempo real visible en el encabezado global global (**Obsidian Header**), indicando notificaciones sin leer sobre invitaciones a entrevistas, decisiones del ATS y nuevos chats sin necesidad de refrescar la app.

---

## 🛠️ Tecnologías y Stack Utilizado

*   **Frontend Mobile:** `React Native` (Expo v54) con `TypeScript`.
*   **Diseño y Estilos:** `Tailwind CSS (NativeWind)` junto con `StyleSheet` nativos de React Native para efectos de desenfoque translúcidos (`expo-blur`), neones y tipografías premium.
*   **Backend as a Service (BaaS):** `Supabase` (Base de datos relacional PostgreSQL con RLS y triggers automáticos de autenticación).
*   **Tiempo Real:** Canales y replicación en caliente de `Supabase Realtime`.
*   **Almacenamiento Seguro:** Buckets en `Supabase Storage` para la carga interactiva de CVs en formato PDF e imágenes.

---

## 📁 Arquitectura General del Proyecto

```text
Aptly/
├── App.tsx                   # Punto de entrada de React Native Expo
├── components/               # Elementos visuales reutilizables de UI (ObsidianHeader, Loaders)
├── lib/                      # Cliente e inicializador de Supabase
├── navigation/               # Stacks de pantallas y BottomTabs
├── screens/                  # Módulos principales y pantallas
│   ├── auth/                 # Flujos de Onboarding interactivo paso a paso y accesos
│   ├── applications/         # Mis Postulaciones, línea de tiempo ATS y carga de CVs (PDF)
│   ├── chat/                 # Bandejas de entrada y salas de conversación enriquecidas
│   ├── profiles/             # Hub Profesional del Candidato y sus editores en 5 pasos
│   └── business/             # Consola de Empresa, creador de ofertas, Match Finder y Kanban
├── README.md                 # Portal de presentación principal en GitHub
├── Manual_Usuario.md         # Manual ilustrado exhaustivo (63 pantallas reales)
├── Documentacion_Tecnica.md  # Arquitectura detallada, diagramas MER y guía técnica
├── supabase_migration.sql    # Estructuras DDL de tablas relacionales y triggers
└── supabase_seed_data.sql    # Datos realistas de prueba para candidatos y corporaciones
```

---

## 🚀 Guía Rápida de Instalación Local

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/tu-usuario/aptly.git
    cd aptly
    ```
2.  **Instala las dependencias:**
    ```bash
    npm install
    ```
3.  **Configura Supabase:**  
    Asegura que tu cliente en `lib/supabase.ts` apunte a tu base de datos Supabase con la URL y clave anónima correctas:
    ```typescript
    const supabaseUrl = 'https://fohcutrrhrihvzrvynxz.supabase.co';
    const supabaseAnonKey = 'TU_KEY_ANONIMA_SUPABASE';
    ```
4.  **Inicia la aplicación:**
    ```bash
    npm run start
    ```
    *Escanea el código QR desde tu app **Expo Go** (Android/iOS) o presiona `a` para abrir el emulador de Android.*
