/**
 * CineMatch Backend - Express Integration Tests
 */

// Set up frontend URL environment variable before imports to configure config module
process.env.FRONTEND_URL = 'https://app.cinematch.com';
process.env.PORT = '3002'; // Avoid port conflicts

import request from 'supertest';
import { Application } from 'express';
import { createApp } from './app';

describe('Express Application Hardening & Integration', () => {
    let app: Application;

    beforeAll(() => {
        app = createApp();
    });

    describe('Production Security Headers (Helmet) - SEC-2.1', () => {
        it('should return standard security headers including X-Content-Type-Options: nosniff', async () => {
            const res = await request(app).get('/');
            
            // Helmet headers
            expect(res.headers['x-content-type-options']).toBe('nosniff');
            expect(res.headers['x-dns-prefetch-control']).toBeDefined();
            expect(res.headers['x-frame-options']).toBeDefined();
            expect(res.headers['x-permitted-cross-domain-policies']).toBeDefined();
        });
    });

    describe('CORS Origin Restricting - SEC-1.1, SEC-1.2', () => {
        it('should allow request when origin matches FRONTEND_URL', async () => {
            const res = await request(app)
                .get('/')
                .set('Origin', 'https://app.cinematch.com');
            
            expect(res.headers['access-control-allow-origin']).toBe('https://app.cinematch.com');
        });

        it('should block request or not reflect Access-Control-Allow-Origin when origin is malicious', async () => {
            const res = await request(app)
                .get('/')
                .set('Origin', 'https://malicious-site.com');
            
            // Standard CORS middleware doesn't return the allowed origin header if disallowed
            expect(res.headers['access-control-allow-origin']).toBeUndefined();
        });
    });

    describe('Request Rate Limiting - SEC-3.1, SEC-3.2', () => {
        it('should allow requests within rate limit but block the 101st request', async () => {
            // Get a completely fresh app instance to isolate the rate limiter memory
            const freshApp = createApp();

            // Send 100 requests (99 in loop + 1 for assertion)
            for (let i = 0; i < 99; i++) {
                const response = await request(freshApp).get('/ping');
                expect(response.status).toBe(200);
            }

            // The 100th request should succeed
            const hundredth = await request(freshApp).get('/ping');
            expect(hundredth.status).toBe(200);

            // The 101st request should be rejected with 429 (Too Many Requests)
            const response101 = await request(freshApp).get('/ping');
            expect(response101.status).toBe(429);
            expect(response101.body.code).toBe('TOO_MANY_REQUESTS');
        });
    });
});
