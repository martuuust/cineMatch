# CineMatch 🎬🍿

CineMatch es una aplicación web en tiempo real diseñada para acabar con las discusiones sobre qué película ver. Permite a grupos de amigos o parejas unirse a una sala virtual, votar "Sí" o "No" a recomendaciones de películas y encontrar el "Match" perfecto cuando todos coinciden.

## 🏗️ Arquitectura del Proyecto

El proyecto sigue una arquitectura cliente-servidor separada, pero contenida en un mismo repositorio para facilitar el desarrollo local. La comunicación principal es **bidireccional en tiempo real** mediante WebSockets.

### 🟣 Frontend (Cliente)
Ubicado en el directorio raíz.
- **Tecnología Principal**: [React](https://react.dev/) v19 + [Vite](https://vitejs.dev/) v6.
- **Lenguaje**: TypeScript.
- **Comunicación**: `socket.io-client` para eventos en tiempo real (unirse a salas, votar, resultados).
- **Enrutamiento**: `react-router-dom` para la navegación entre páginas (Home -> Crear Sala -> Sala de Espera -> Votación -> Resultados).
- **Estilos**: Vanilla CSS con variables globales para un diseño moderno y oscuro ("Dark Mode").
- **Animaciones**: `framer-motion` para transiciones suaves de tarjetas y efectos de UI.
- **Iconos**: `lucide-react`.

### 🟢 Backend (Servidor)
Ubicado en el directorio `/backend`.
- **Tecnología Principal**: [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/).
- **Lenguaje**: TypeScript.
- **Real-Time Engine**: `socket.io` server para gestionar salas, usuarios y sincronización de votos.
- **Base de Datos**: **Redis** (`DataStore` async). Persiste salas y votos entre reinicios y permite escalar horizontalmente con `@socket.io/redis-adapter`.
- **Hostería de API**: Se conecta con APIs externas (como TMDB - The Movie Database) para obtener información real de películas.

---

## 🚀 Cómo ejecutar el proyecto

### Opción Recomendada (Windows)
Simplemente haz doble clic en el archivo `start-app.bat` ubicado en la raíz del proyecto.
Este script abrirá automáticamente dos ventanas de terminal: una para el backend y otra para el frontend.

### Opción Manual
Si prefieres hacerlo manualmente o estás en otro sistema operativo:

#### 1. Iniciar el Backend (Servidor)
El backend debe estar corriendo primero.

1. Abre una terminal y navega a la carpeta del backend:
   ```bash
   cd backend
   ```
2. Instala las dependencias (solo la primera vez):
   ```bash
   npm install
   ```
3. Inicia el servidor:
   ```bash
   npm run dev
   ```

#### 2. Iniciar el Frontend (Cliente)
1. Abre **otra** terminal y navega a la raíz del proyecto:
   ```bash
   cd c:\Users\margosa\Desktop\Digitalizacion\cineMatch
   ```
2. Instala las dependencias (solo la primera vez):
   ```bash
   npm install
   ```
3. Inicia la aplicación web:
   ```bash
   npm run dev
   ```
4. Abre el navegador en `http://localhost:5173`.

---

## 🐳 Docker
Actualmente el proyecto **no cuenta con contenedores Docker**.
Para su despliegue o ejecución, se depende del entorno local de Node.js. Si se desea dockerizar en el futuro, se requeriría crear un `Dockerfile` para el frontend (build de producción con nginx/serve) y otro para el backend, orquestados mediante un `docker-compose.yml`.

## 📂 Estructura de Carpetas

```
cineMatch/
├── backend/            # Servidor Node.js
│   ├── src/
│   │   ├── controllers/ # Controladores REST (opcional)
│   │   ├── services/    # Lógica de negocio (Rooms, Users, Votes)
│   │   ├── socket/      # Manejadores de eventos Socket.io
│   │   ├── data/        # Almacenamiento en memoria
│   │   └── ...
├── components/         # Componentes React reutilizables
├── context/            # Estado global (AppContext)
├── pages/              # Vistas principales (CreateRoom, Voting, etc.)
├── services/           # Servicios frontend (API clients)
└── ...
```

---

## ✨ Características Clave
- **Sin Login persistente**: Los usuarios son anónimos por sesión.
- **Sincronización total**: Si un usuario se desconecta o termina de votar, todos los demás ven el progreso en tiempo real.
- **Algoritmo de Match**: La sala termina y anuncia el ganador en el momento exacto en que hay una coincidencia unánime o todos terminan de votar.
