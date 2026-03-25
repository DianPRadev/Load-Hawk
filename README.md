# LoadHawk - Your Freight Navigator

## Playwright

Run the browser smoke suite with:

```bash
npm run test:e2e
```

The default setup starts the Vite app on `http://127.0.0.1:8080`.

If you want to point the same suite at another local target, override:

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000
PLAYWRIGHT_WEB_SERVER_COMMAND="vercel dev --listen 127.0.0.1:3000"
npm run test:e2e
```
