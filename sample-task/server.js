import http from 'node:http';

// State X: Minimal in-memory items database
let items = [
  { id: 1, name: 'Item Alpha', price: 29.99 },
  { id: 2, name: 'Item Beta', price: 49.99 }
];
let nextId = 3;

export function createApp() {
  return http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const method = req.method;

    // Helper to send JSON
    const sendJson = (status, data) => {
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    };

    // GET /items
    if (url.pathname === '/items' && method === 'GET') {
      return sendJson(200, { items });
    }

    // GET /items/:id
    if (url.pathname.startsWith('/items/') && method === 'GET') {
      const id = parseInt(url.pathname.split('/')[2], 10);
      const item = items.find(i => i.id === id);
      if (!item) {
        return sendJson(404, { error: 'Item not found' });
      }
      return sendJson(200, { item });
    }

    // POST /items
    if (url.pathname === '/items' && method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const parsed = JSON.parse(body || '{}');
          if (!parsed.name || typeof parsed.price !== 'number') {
            return sendJson(400, { error: 'Invalid item payload' });
          }
          const newItem = {
            id: nextId++,
            name: parsed.name,
            price: parsed.price
          };
          items.push(newItem);
          return sendJson(201, { item: newItem });
        } catch {
          return sendJson(400, { error: 'Invalid JSON' });
        }
      });
      return;
    }

    // 404 fallback
    sendJson(404, { error: 'Not found' });
  });
}

// Allow standalone execution
if (process.argv[1] && process.argv[1].endsWith('server.js')) {
  const PORT = process.env.PORT || 3000;
  const app = createApp();
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}
