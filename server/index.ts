import express from "express";
import { createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// API routes (placeholder)
app.get("/api/employees", (req, res) => {
  res.json([
    {
      id: 1,
      fullName: "Sebastião Expedito De Freitas Neto",
      email: "sebastiaofreitas@contasolucoes.com.br",
      phone: "(22) 3822-2919",
      position: "Consultor Técnico",
      status: "active",
    },
  ]);
});

// Vite middleware for development
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res) => {
    const url = req.originalUrl;
    try {
      const html = await vite.transformIndexHtml(url, `
        <!doctype html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Cartão de Visita Virtual</title>
          </head>
          <body>
            <div id="root"></div>
            <script type="module" src="/src/main.tsx"><\/script>
          </body>
        </html>
      `);
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      res.status(500).end((e as Error).message);
    }
  });
} else {
  // Production: serve static files
  app.use(express.static(path.join(__dirname, "../dist/public")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../dist/public/index.html"));
  });
}

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
