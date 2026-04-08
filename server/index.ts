import express from "express";
import cors from "cors";
import { db } from "./db";
import { employees } from "../drizzle/schema";

const app = express();
app.use(cors());
app.use(express.json());

// TESTE
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// LISTAR FUNCIONÁRIOS
app.get("/api/employees", async (req, res) => {
  try {
    const result = await db.select().from(employees);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar funcionários" });
  }
});

// BUSCAR POR ID
app.get("/api/employees/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const result = await db
      .select()
      .from(employees)
      .where(employees.id.eq(id));

    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar funcionário" });
  }
});

// CRIAR FUNCIONÁRIO
app.post("/api/employees", async (req, res) => {
  try {
    const data = req.body;

    const result = await db.insert(employees).values(data);

    res.json({ success: true, result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar funcionário" });
  }
});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
