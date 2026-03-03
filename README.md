💼 Aptly: Professional Matchmaking KitBashpnpm install && npx expo start -c
🧑‍🚀 ¿Listo para conectar talento? Este es el inicio de tu plataforma de reclutamiento moderna. ¡Configura tu entorno y empieza a buildear!🚀 Estructura del ProyectoDentro de tu proyecto de Aptly, encontrarás la siguiente organización de archivos basada en componentes atómicos y pantallas:Plaintext/
├── assets/
│   ├── favicon.png          # Logo de la aplicación utilizado en el branding
│   └── morocho.jpg          # Recursos visuales del equipo
├── src
│   ├── components
│   │   ├── EditScreenInfo.tsx   # Gestión de bio y detalles del perfil
│   │   ├── CustomButton.tsx     # Botones reutilizables con Tailwind
│   │   └── ScreenContent.tsx    # Layout base para títulos y secciones
│   ├── screens
│   │   ├── LoginScreen.tsx      # Interfaz de acceso con UI de Glassmorphism
│   │   └── WelcomeScreen.tsx    # Animación de entrada inicial
├── App.tsx                  # Orquestador principal y punto de entrada
├── global.css               # Estilos globales de NativeWind
└── package.json             # Manifiesto de dependencias y scripts
Para aprender más sobre cómo escalar esta estructura, consulta la sección de Buenas Prácticas en la documentación de tu equipo.🧞 Comandos PrincipalesTodos los comandos se ejecutan desde la raíz del proyecto a través de la terminal:ComandoAcciónpnpm installInstala todas las dependencias necesariasnpx expo startInicia el servidor de desarrollo de Metronpx expo start -cInicia el servidor limpiando la caché (Recomendado)npx expo run:androidEjecuta el build nativo en emulador Androidnpx expo run:iosEjecuta el build nativo en simulador iOSpnpm add <libreria>Instala nuevos paquetes al proyecto👀 ¿Qué sigue para Aptly?Actualmente, el proyecto cuenta con una base sólida de NativeWind para el diseño responsivo. El siguiente paso en el flujo de navegación incluye:Matching System: Implementación de gestos de deslizamiento (swiping).Chat Real-time: Conexión entre empresas y candidatos tras el match.User Roles: Lógica para diferenciar entre perfiles de reclutador y talento.
