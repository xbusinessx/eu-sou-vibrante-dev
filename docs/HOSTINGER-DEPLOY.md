# Deploy na Hostinger

Projeto Vite front-end-only, preparado para Node.js `22.x` e output em `dist/`.

## Comandos locais

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Configuração na Hostinger

Use **Node.js Web App**.

- Framework: Vite
- Node.js version: `22.x`
- Install command: `npm ci` se houver `package-lock.json`, ou `npm install`
- Build command: `npm run build`
- Output directory: `dist`

## Observação sobre servidor

Este projeto não depende de backend persistente. A build do Vite gera arquivos estáticos em `dist/`.

Se a Hostinger pedir um entry file de servidor, use um fallback simples apenas para servir `dist`, por exemplo `server.js` com Express. Não implemente backend se a hospedagem puder servir a pasta estática diretamente.

Exemplo de fallback, se necessário:

```js
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "dist")));
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(port, () => {
  console.log(`Serving dist on port ${port}`);
});
```
