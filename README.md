# 🎬 CineMatch - Encuentra tu Película Perfecta

<div align="center">
  <img src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" alt="CineMatch Banner" width="100%" />
</div>

## ✨ Descripción

**CineMatch** es una aplicación web que permite a grupos de amigos votar películas juntos usando un sistema tipo "swipe" (similar a Tinder). Cada usuario puede crear o unirse a una sala, votar películas haciendo swipe, y al final descubrir qué película fue votada positivamente por todos.

### 🚀 Características

- 🎯 **Votación en tiempo real** - Swipe para votar películas
- 👥 **Salas colaborativas** - Crea o únete a salas con código
- 🎨 **Diseño Premium** - UI moderna con glassmorphism y animaciones fluidas
- 📱 **Responsive** - Optimizado para móvil y desktop
- 🎉 **Efectos visuales** - Confeti, partículas flotantes y transiciones
- 🔄 **WebSocket** - Sincronización en tiempo real entre usuarios

---

## 🛠️ Instalación y Ejecución

### Requisitos Previos

- **Node.js** v18 o superior
- **npm** o **yarn**

### Paso 1: Instalar Dependencias del Backend

```bash
cd cinematch/backend
npm install
```

### Paso 2: Iniciar el Backend

```bash
cd cinematch/backend
npm run dev
```

El servidor backend se ejecutará en `http://localhost:3001`

### Paso 3: Instalar Dependencias del Frontend

Abre una **nueva terminal** y ejecuta:

```bash
cd cinematch
npm install
```

### Paso 4: Iniciar el Frontend

```bash
cd cinematch
npm run dev
```

El frontend se ejecutará en `http://localhost:5173`

---

## 🎮 Cómo Usar

1. **Abre** `http://localhost:5173` en tu navegador
2. **Crea una sala** haciendo clic en "Crear Sala"
3. **Comparte el código** con tus amigos
4. **Espera** a que se unan (mínimo 2 personas)
5. **El anfitrión inicia** la votación
6. **Haz swipe** a la derecha para "Me gusta" o izquierda para "No me gusta"
7. **¡Descubre el match!** - La película que todos votaron positivamente

---

## 📁 Estructura del Proyecto

```
cinematch/
├── backend/                 # Servidor Node.js + Express + Socket.io
│   ├── src/
│   │   ├── controllers/     # Controladores de API
│   │   ├── routes/          # Rutas de Express
│   │   ├── services/        # Lógica de negocio
│   │   ├── socket/          # Manejadores de WebSocket
│   │   └── index.ts         # Punto de entrada del servidor
│   ├── .env                 # Variables de entorno
│   └── package.json
│
├── components/              # Componentes React reutilizables
│   └── ui/                  # Button, Input, Card, Avatar
│
├── context/                 # Estado global (React Context)
│   └── AppContext.tsx
│
├── pages/                   # Páginas de la aplicación
│   ├── HomePage.tsx         # Pantalla de inicio
│   ├── CreateRoomPage.tsx   # Crear sala
│   ├── JoinRoomPage.tsx     # Unirse a sala
│   ├── WaitingRoomPage.tsx  # Sala de espera
│   ├── SwipePage.tsx        # Votación (swipe)
│   └── ResultsPage.tsx      # Resultados y match
│
├── services/                # Servicios de comunicación
│   ├── api.ts               # Cliente HTTP REST
│   └── socket.ts            # Cliente WebSocket
│
├── index.html               # HTML principal
├── index.css                # Estilos globales
├── index.tsx                # Punto de entrada React
├── App.tsx                  # Router principal
└── package.json
```

---

## 🎨 Tecnologías Utilizadas

### Frontend
- **React 19** - Biblioteca UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool ultrarrápido
- **Framer Motion** - Animaciones fluidas
- **TailwindCSS** - Utilidades CSS
- **Lucide React** - Iconos

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **Socket.io** - Comunicación en tiempo real
- **TypeScript** - Tipado estático

---

## 🔧 Configuración

### Variables de Entorno del Backend (`backend/.env`)

```env
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
TMDB_API_KEY=tu_api_key_de_tmdb
```

### Variables de Entorno del Frontend (`.env.local`)

```env
VITE_API_URL=http://localhost:3001/api
```

---

## 📱 Comandos Rápidos

```bash
# Desarrollo completo (2 terminales)
# Terminal 1 - Backend:
cd cinematch/backend && npm run dev

# Terminal 2 - Frontend:
cd cinematch && npm run dev

# Build de producción
cd cinematch && npm run build
cd cinematch/backend && npm run build
```

---

## 🎉 ¡Disfruta la app!

Hecha con ❤️ para noches de películas con amigos.
