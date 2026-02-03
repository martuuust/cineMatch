# 🎬 CineMatch Backend

Backend API para CineMatch - Sistema de matching de películas en tiempo real.

## 📋 Tecnologías

- **Node.js** con **TypeScript**
- **Express.js** - API REST
- **Socket.io** - Comunicación en tiempo real
- **express-validator** - Validación de inputs
- **UUID** - Generación de identificadores únicos

## 🚀 Instalación y Ejecución

### Requisitos previos
- Node.js 18+ 
- npm 9+

### Instalación

```bash
cd backend
npm install
```

### Configuración

Copia el archivo de ejemplo y configura las variables:

```bash
cp .env.example .env
```

Variables de entorno:
| Variable | Descripción | Default |
|----------|-------------|---------|
| `PORT` | Puerto del servidor | `3001` |
| `NODE_ENV` | Entorno (development/production) | `development` |
| `CORS_ORIGIN` | Origen permitido para CORS | `http://localhost:5173` |
| `TMDB_API_KEY` | API key de TMDB (opcional) | - |

### Ejecución

**Desarrollo (con hot-reload):**
```bash
npm run dev
```

**Producción:**
```bash
npm run build
npm start
```

## 📡 API REST

### Crear Sala

```http
POST /api/rooms/create
Content-Type: application/json

{
  "userName": "string"
}
```

**Response (201):**
```json
{
  "roomCode": "ABCD-1234",
  "userId": "uuid"
}
```

### Unirse a Sala

```http
POST /api/rooms/join
Content-Type: application/json

{
  "roomCode": "ABCD-1234",
  "userName": "string"
}
```

**Response (200):**
```json
{
  "roomId": "uuid",
  "userId": "uuid"
}
```

### Obtener Películas

```http
GET /api/movies/batch
```

**Response (200):**
```json
{
  "movies": [
    {
      "id": 1,
      "title": "Inception",
      "posterPath": "https://...",
      "rating": 8.8,
      "duration": 148,
      "genres": ["Sci-Fi", "Action"],
      "overview": "..."
    }
  ]
}
```

> Devuelve exactamente 20 películas en orden determinista.

### Health Check

```http
GET /api/health
```

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔌 Socket.io Events

### Conexión

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  withCredentials: true
});
```

### Eventos del Cliente → Servidor

#### `user-joined`
Notifica que un usuario se unió a la sala (después de crear/unirse via REST).

```javascript
socket.emit('user-joined', {
  roomCode: 'ABCD-1234',
  userId: 'uuid'
});
```

#### `start-voting`
El host inicia la votación.

```javascript
socket.emit('start-voting', {
  roomCode: 'ABCD-1234',
  userId: 'host-uuid'
});
```

#### `vote`
Envía un voto para una película.

```javascript
socket.emit('vote', {
  roomCode: 'ABCD-1234',
  userId: 'uuid',
  movieId: 1,
  voteType: 'yes' // o 'no'
});
```

#### `reconnect-user`
Reconectar usuario después de desconexión.

```javascript
socket.emit('reconnect-user', {
  userId: 'uuid',
  roomCode: 'ABCD-1234'
});
```

### Eventos del Servidor → Cliente

#### `user-list-updated`
Lista de usuarios actualizada.

```javascript
socket.on('user-list-updated', ({ users }) => {
  // users: Array<{ id, name, isHost, progress, hasFinished }>
});
```

#### `voting-started`
La votación ha comenzado.

```javascript
socket.on('voting-started', () => {
  // Navegar a pantalla de votación
});
```

#### `user-progress`
Progreso de votación de un usuario.

```javascript
socket.on('user-progress', ({ userId, progress, hasFinished }) => {
  // progress: 0-100
  // hasFinished: boolean
});
```

#### `matching-complete`
Resultado final del matching.

```javascript
socket.on('matching-complete', (result) => {
  if (result.type === 'perfect_match') {
    // result.match: Movie con 100% votos positivos
  } else {
    // result.topPicks: Array<{ movie, yesVotes, totalVotes, ratio }>
  }
});
```

#### `error`
Error del servidor.

```javascript
socket.on('error', ({ error, code }) => {
  console.error(`Error ${code}: ${error}`);
});
```

## 🔄 Flujo de Eventos

```
┌─────────────────────────────────────────────────────────────┐
│                     FLUJO DE CINEMATCH                       │
└─────────────────────────────────────────────────────────────┘

1. CREAR SALA
   Host → POST /api/rooms/create
   Host ← { roomCode, userId }
   Host → socket.emit('user-joined')
   All  ← socket.on('user-list-updated')

2. UNIRSE A SALA
   Guest → POST /api/rooms/join
   Guest ← { roomId, userId }
   Guest → socket.emit('user-joined')
   All   ← socket.on('user-list-updated')

3. INICIAR VOTACIÓN (solo host, mín. 2 usuarios)
   Host → socket.emit('start-voting')
   All  ← socket.on('voting-started')

4. VOTACIÓN
   User → socket.emit('vote', { movieId, voteType })
   All  ← socket.on('user-progress')
   
5. RESULTADO (cuando todos terminan)
   All ← socket.on('matching-complete')
```

## 🧮 Lógica de Matching

1. Cada usuario vota por las 20 películas (sí/no)
2. Se calcula el progreso como porcentaje (votos/20 × 100)
3. Al finalizar todos:
   - Si existe película con 100% votos "sí" → **Perfect Match**
   - Si no → **Top 3** ordenados por ratio de votos positivos

## 🛡️ Reglas de Negocio

- Mínimo **2 usuarios** para iniciar votación
- Solo el **host** puede iniciar votación
- No se puede votar fuera del estado `voting`
- Votos duplicados son rechazados
- Usuarios desconectados no invalidan la votación
- Reconexión de sockets mantiene el estado

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/           # Configuración
│   │   └── index.ts
│   ├── controllers/      # Controladores HTTP
│   │   ├── movieController.ts
│   │   └── roomController.ts
│   ├── data/             # Capa de datos
│   │   ├── movies.ts     # Mock data (20 películas)
│   │   └── store.ts      # In-memory store
│   ├── middleware/       # Middlewares Express
│   │   └── errorHandler.ts
│   ├── routes/           # Rutas API
│   │   ├── index.ts
│   │   ├── movieRoutes.ts
│   │   └── roomRoutes.ts
│   ├── services/         # Lógica de negocio
│   │   ├── roomService.ts
│   │   ├── userService.ts
│   │   └── voteService.ts
│   ├── socket/           # Handlers Socket.io
│   │   └── socketHandler.ts
│   ├── types/            # Definiciones TypeScript
│   │   └── index.ts
│   ├── utils/            # Utilidades
│   │   ├── errors.ts
│   │   └── helpers.ts
│   ├── app.ts            # Configuración Express
│   └── index.ts          # Entry point
├── .env
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── tsconfig.json
```

## 🔧 Códigos de Error

| Código | Descripción |
|--------|-------------|
| `ROOM_NOT_FOUND` | Sala no encontrada |
| `ROOM_ALREADY_STARTED` | La votación ya comenzó |
| `ROOM_NOT_READY` | Faltan usuarios (mín. 2) |
| `ROOM_FULL` | Sala llena (máx. 10) |
| `USER_NOT_FOUND` | Usuario no encontrado |
| `USER_NOT_HOST` | No es el host |
| `VOTING_NOT_STARTED` | Votación no iniciada |
| `DUPLICATE_VOTE` | Voto duplicado |
| `INVALID_MOVIE` | ID de película inválido |
| `VALIDATION_ERROR` | Error de validación |
| `INTERNAL_ERROR` | Error interno |

## 📊 Modelo de Datos

```typescript
// Room
{
  id: string
  code: string        // XXXX-XXXX
  status: 'waiting' | 'voting' | 'finished'
  hostId: string
  movieIds: number[]
}

// User
{
  id: string
  name: string
  roomId: string
  isHost: boolean
  progress: number    // 0-100
  hasFinished: boolean
}

// Vote
{
  id: string
  userId: string
  roomId: string
  movieId: number
  vote: 'yes' | 'no'
}
```

## 🚀 Escalabilidad

El backend está preparado para escalar:

- **Estado desacoplado**: El `DataStore` puede reemplazarse por Redis
- **Socket.io Adapter**: Listo para Redis adapter en múltiples instancias
- **Stateless HTTP**: Los endpoints REST no mantienen estado

## 📝 Licencia

ISC
