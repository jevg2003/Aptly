# Aptly – Professional Matchmaking Platform 🚀

Aptly es una plataforma moderna de **matchmaking profesional** que conecta talento con empresas mediante un sistema de coincidencias inteligentes, inspirado en experiencias de usuario modernas.

Este proyecto está construido con **React Native + Expo**, utilizando una arquitectura basada en **componentes reutilizables y diseño moderno**.

---

# 📦 Instalación

Clona el repositorio e instala las dependencias:

```bash
npm install
```

Luego inicia el proyecto:

```bash
npx expo start
```

---

# 🛠 Tecnologías utilizadas

* React Native
* Expo
* TypeScript
* Tailwind CSS (NativeWind)
* Arquitectura basada en componentes

---

# 📁 Estructura del proyecto

```
Aptly
│
├── assets
│   ├── favicon.png        # Logo de la aplicación
│   └── moroco.jpg         # Recursos visuales
│
├── src
│   ├── components
│   │   ├── CustomButton.tsx    # Botones reutilizables con Tailwind
│   │   └── ScreenContent.tsx   # Layout base para títulos y secciones
│   │
│   └── screens
│       ├── LoginScreen.tsx     # Pantalla de inicio de sesión
│       ├── WelcomeScreen.tsx   # Animación de entrada inicial
│       └── EditScreenInfo.tsx  # Gestión de bio y detalles del perfil
│
├── App.tsx               # Punto de entrada de la aplicación
├── global.css            # Estilos globales de NativeWind
└── package.json          # Dependencias y scripts
```

---

# ▶️ Comandos principales

Todos los comandos se ejecutan desde la raíz del proyecto.

| Comando                | Descripción                             |
| ---------------------- | --------------------------------------- |
| `npm install`          | Instala todas las dependencias          |
| `npx expo start`       | Inicia el servidor de desarrollo        |
| `npx expo start -c`    | Inicia el servidor limpiando la caché   |
| `npx expo run:android` | Ejecuta el proyecto en emulador Android |
| `npx expo run:ios`     | Ejecuta el proyecto en simulador iOS    |
| `npm add <package>`    | Instala nuevos paquetes                 |

---

# 🎨 Diseño UI

La interfaz utiliza **Glassmorphism + NativeWind** para lograr una apariencia moderna, minimalista y responsive.

Características del diseño:

* Componentes reutilizables
* Estilos consistentes
* Layout adaptable
* Experiencia tipo aplicación social moderna

---

# 🚀 Próximas funcionalidades

### Matching System

Sistema de coincidencias mediante **gestos de deslizamiento (swiping)** entre perfiles.

### Chat en tiempo real

Conexión directa entre empresas y candidatos una vez se produce el match.

### Roles de usuario

Sistema para diferenciar:

* Reclutadores
* Talento / Candidatos

### Perfil profesional

Edición de información profesional, habilidades y experiencia.

---

# 📚 Buenas prácticas

El proyecto sigue una arquitectura basada en:

* Componentes reutilizables
* Separación de lógica y UI
* Organización modular de carpetas
* Escalabilidad para nuevas funcionalidades

---

# 👨‍💻 Autor

Proyecto desarrollado como parte de un proceso de aprendizaje en desarrollo de aplicaciones móviles y arquitectura moderna con React Native.

---

⭐ Si te gusta el proyecto, ¡no olvides darle una estrella al repositorio!
