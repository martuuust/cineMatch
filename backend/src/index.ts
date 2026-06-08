/**
 * CineMatch Backend - Server Entry Point
 * 
 * Initializes Express server with Socket.io
 */

import http from 'http';
import { Server as SocketServer } from 'socket.io';
import { createApp } from './app';
import { config } from './config';
import { setupSocketHandlers } from './socket/socketHandler';
import { startCleanupService, stopCleanupService } from './services/cleanupService';

// Create Express app
const app = createApp();

// Create HTTP server
const server = http.createServer(app);

// Create Socket.io server
const io = new SocketServer(server, {
    cors: {
        origin: config.corsOrigin,
        methods: ['GET', 'POST'],
        credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
});

// Setup socket handlers
setupSocketHandlers(io);

// Start server
const HOST = '0.0.0.0';
server.listen(config.port, HOST, () => {
    // Start background room cleanup service
    startCleanupService();

    console.log('');
    console.log('🎬 ═══════════════════════════════════════════════════════');
    console.log('   CineMatch Backend Server');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`   Environment: ${config.nodeEnv}`);
    console.log(`   Host:        ${HOST}`);
    console.log(`   Port:        ${config.port}`);
    console.log(`   CORS Origin: ${config.corsOrigin}`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('📡 API Endpoints:');
    console.log(`   POST /api/rooms/create  - Create new room`);
    console.log(`   POST /api/rooms/join    - Join existing room`);
    console.log(`   GET  /api/movies/batch  - Get movies for voting`);
    console.log(`   GET  /api/health        - Health check`);
    console.log('');
    console.log('🔌 Socket Events (Client -> Server):');
    console.log(`   user-joined   - User joins room socket`);
    console.log(`   start-voting  - Host starts voting`);
    console.log(`   vote          - Submit movie vote`);
    console.log('');
    console.log('📤 Socket Events (Server -> Client):');
    console.log(`   user-list-updated  - Updated user list`);
    console.log(`   voting-started     - Voting has begun`);
    console.log(`   user-progress      - User voting progress`);
    console.log(`   matching-complete  - Final results`);
    console.log('');
    console.log('🎬 Server ready! Waiting for connections...');
    console.log('');
});

// Graceful shutdown
function shutdown(signal: string): void {
    console.log(`${signal} received. Shutting down gracefully...`);
    stopCleanupService();
    server.close(() => {
        console.log('Server closed.');
        process.exit(0);
    });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export { server, io };
