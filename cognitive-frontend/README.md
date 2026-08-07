# Frontend

React 18 + Vite + Tailwind SPA for the cognitive learning platform.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

Set `VITE_API_BASE` in `.env` if the API is not at `http://127.0.0.1:8000/api` (see `.env.example`).

Main entry: `src/App.jsx` (role-guarded routes for citizen / expert / manager).
