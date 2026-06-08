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
Haz doble clic en `start-app.bat` en la raíz del proyecto.

- **Con Docker Desktop activo**: levanta Redis, backend y frontend con `docker compose up --build`.
- **Sin Docker**: abre dos terminales con `npm run dev` (necesitas Redis en `localhost:6379`).

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

Levanta Redis, backend y frontend con un solo comando:

```bash
# Opcional: películas reales desde TMDB
cp .env.docker.example .env
# Edita .env y añade tu TMDB_API_KEY

docker compose up --build
```

| Servicio  | URL                      |
|-----------|--------------------------|
| Frontend  | http://localhost:5173    |
| Backend   | http://localhost:3001    |
| Redis     | localhost:6379           |

Para detener y eliminar contenedores:

```bash
docker compose down
```

Para detener y borrar también los datos de Redis:

```bash
docker compose down -v
```

## Despliegue en Render

1. Sube el código a GitHub (`git push`).
2. En [Render](https://render.com) → **New** → **Blueprint** → conecta el repo.
3. Render crea Redis, backend y frontend desde `render.yaml`.
4. En el servicio **cinematch-backend**, añade `TMDB_API_KEY` (opcional).
5. Tras el primer deploy, verifica que `FRONTEND_URL` en el backend apunte al dominio del frontend (Render lo enlaza automáticamente vía Blueprint).

## CI

Cada push a `main` ejecuta lint, tests y build (backend + frontend + Docker) en GitHub Actions (`.github/workflows/ci.yml`).

## 📂 Estructura de Carpetas

```
cineMatch/
├── backend/            # Servidor Node.js
│   ├── src/
│   │   ├── controllers/ # Controladores REST (opcional)
│   │   ├── services/    # Lógica de negocio (Rooms, Users, Votes)
│   │   ├── socket/      # Manejadores de eventos Socket.io
│   │   ├── data/        # DataStore (Redis)
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
