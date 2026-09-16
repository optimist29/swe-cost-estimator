# Task: Move Sample App from State X to State Y

## Target Goal:
Enhance the existing REST API in `server.js` with security and auditing features, and update `test.js` to ensure 100% test coverage.

## Instructions:
1. **Rate Limiting**:
   - Add in-memory sliding window or token-bucket rate limiting allowing a maximum of **60 requests per minute** per client IP.
   - If exceeded, return `429 Too Many Requests` with `{ "error": "Rate limit exceeded" }`.
2. **Authenticated Healthcheck**:
   - Add endpoint `GET /health/system`.
   - Requires `Authorization: Bearer secret-agent-token`.
   - If missing or invalid, return `401 Unauthorized` with `{ "error": "Unauthorized" }`.
   - If valid, return `200 OK` with `{ "status": "healthy", "uptime": process.uptime() }`.
3. **Item Creation Timestamp**:
   - Update `POST /items` so newly created items automatically include `createdAt: new Date().toISOString()`.
4. **Verification**:
   - Add new tests covering all 3 features in `test.js`.
   - Run `node --test test.js` and ensure all tests pass.
