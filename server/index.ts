import express from "express";
import cors from "cors";
import { eq } from "drizzle-orm";
import { db } from "./db";
import {
  employees,
  contracts,
  contractItems,
  contractTerms,
  contractTermItems,
  contractAttachments,
} from "../drizzle/schema";

const app = express();

app.use(cors());
app.use(express.json());

function roundCurrency(value: number) {
  return Number(value.toFixed(2));
}

function calculateInstallmentValue(totalValue: number, installments: number) {
  return roundCurrency(totalValue / installments);
}

function calculateItemTotal(quantity: number, unitValue: number) {
  return roundCurrency(quantity * unitValue);
}

function normalizeNumber(value: unknown, defaultValue = 0) {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? defaultValue : parsed;
}

// TESTE
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// =========================
// FUNCIONÁRIOS
// =========================

// LISTAR FUNCIONÁRIOS
app.get("/api/employees", async (_req, res) => {
  try {
    const result = await db.select().from(employees);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar funcionários" });
  }
});

// BUSCAR FUNCIONÁRIO POR ID
app.get("/api/employees/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const result = await db
      .select()
      .from(employees)
      .where(eq(employees.id, id));

    res.json(result[0] ?? null);
  } catch (error) {
    console.error(error);
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

// =========================
// CONTRATOS
// =========================

// LISTAR CONTRATOS
app.get("/api/contracts", async (_req, res) => {
  try {
    const result = await db.select().from(contracts);

    const contractsWithCurrentTerm = await Promise.all(
      result.map(async (contract) => {
        const terms = await db
          .select()
          .from(contractTerms)
          .where(eq(contractTerms.contractId, contract.id));

        const sortedTerms = [...terms].sort((a, b) => {
          if (a.termType === "initial" && b.termType === "additive") return -1;
          if (a.termType === "additive" && b.termType === "initial") return 1;
          return a.termNumber - b.termNumber;
        });

        const currentTerm = sortedTerms[sortedTerms.length - 1] ?? null;

        const items = await db
          .select()
          .from(contractItems)
          .where(eq(contractItems.contractId, contract.id));

        return {
          ...contract,
          currentTerm,
          items,
        };
      }),
    );

    res.json(contractsWithCurrentTerm);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar contratos" });
  }
});

// BUSCAR CONTRATO POR ID
app.get("/api/contracts/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const contractResult = await db
      .select()
      .from(contracts)
      .where(eq(contracts.id, id));

    const contract = contractResult[0];

    if (!contract) {
      return res.status(404).json({ error: "Contrato não encontrado" });
    }

    const items = await db
      .select()
      .from(contractItems)
      .where(eq(contractItems.contractId, id));

    const terms = await db
      .select()
      .from(contractTerms)
      .where(eq(contractTerms.contractId, id));

    const sortedTerms = [...terms].sort((a, b) => {
      if (a.termType === "initial" && b.termType === "additive") return -1;
      if (a.termType === "additive" && b.termType === "initial") return 1;
      return a.termNumber - b.termNumber;
    });

    const termsWithItems = await Promise.all(
      sortedTerms.map(async (term) => {
        const termItems = await db
          .select()
          .from(contractTermItems)
          .where(eq(contractTermItems.termId, term.id));

        const attachments = await db
          .select()
          .from(contractAttachments)
          .where(eq(contractAttachments.termId, term.id));

        return {
          ...term,
          items: termItems,
          attachments,
        };
      }),
    );

    const attachments = await db
      .select()
      .from(contractAttachments)
      .where(eq(contractAttachments.contractId, id));

    res.json({
      ...contract,
      items,
      terms: termsWithItems,
      attachments: attachments.filter((item) => item.termId == null),
      currentTerm: sortedTerms[sortedTerms.length - 1] ?? null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar contrato" });
  }
});

// CRIAR CONTRATO + TERMO INICIAL + ITENS
app.post("/api/contracts", async (req, res) => {
  try {
    const {
      contractNumber,
      year,
      clientName,
      cnpj,
      object,
      reajustIndex,
      signatureDate,
      status,
      notes,
      startDate,
      endDate,
      installments,
      items,
    } = req.body;

    if (!contractNumber) {
      return res.status(400).json({ error: "Número do contrato é obrigatório" });
    }

    if (!year) {
      return res.status(400).json({ error: "Ano é obrigatório" });
    }

    if (!clientName) {
      return res.status(400).json({ error: "Cliente/município é obrigatório" });
    }

    if (!cnpj) {
      return res.status(400).json({ error: "CNPJ é obrigatório" });
    }

    if (!object) {
      return res.status(400).json({ error: "Objeto é obrigatório" });
    }

    if (!signatureDate) {
      return res.status(400).json({ error: "Data de assinatura é obrigatória" });
    }

    if (!startDate) {
      return res.status(400).json({ error: "Vigência inicial é obrigatória" });
    }

    if (!endDate) {
      return res.status(400).json({ error: "Vigência final é obrigatória" });
    }

    const parsedInstallments = Number(installments);

    if (!parsedInstallments || parsedInstallments < 1 || parsedInstallments > 12) {
      return res
        .status(400)
        .json({ error: "A quantidade de parcelas deve ser entre 1 e 12" });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ error: "Informe pelo menos um item para o contrato" });
    }

    const normalizedItems = items.map((item: any, index: number) => {
      const description = String(item.description ?? "").trim();
      const quantity = normalizeNumber(item.quantity, 1);
      const unitValue = normalizeNumber(item.unitValue, 0);

      if (!description) {
        throw new Error(`Descrição do item ${index + 1} é obrigatória`);
      }

      if (!quantity || quantity <= 0) {
        throw new Error(`Quantidade do item ${index + 1} é inválida`);
      }

      if (unitValue < 0) {
        throw new Error(`Valor unitário do item ${index + 1} é inválido`);
      }

      return {
        description,
        quantity,
        unitValue: roundCurrency(unitValue),
        totalValue: calculateItemTotal(quantity, unitValue),
      };
    });

    const totalValue = roundCurrency(
      normalizedItems.reduce((acc, item) => acc + item.totalValue, 0),
    );

    const contractInsert = await db.insert(contracts).values({
      contractNumber: String(contractNumber),
      year: Number(year),
      clientName: String(clientName),
      cnpj: String(cnpj),
      object: String(object),
      reajustIndex: String(reajustIndex || "IPCA"),
      signatureDate: String(signatureDate),
      status: String(status || "Vigente"),
      notes: String(notes || ""),
    });

    const contractId = Number((contractInsert as any).insertId);

    for (const item of normalizedItems) {
      await db.insert(contractItems).values({
        contractId,
        description: item.description,
        quantity: item.quantity,
        unitValue: item.unitValue.toFixed(2),
        totalValue: item.totalValue.toFixed(2),
        isActive: 1,
      });
    }

    const itemsCreated = await db
      .select()
      .from(contractItems)
      .where(eq(contractItems.contractId, contractId));

    const termInsert = await db.insert(contractTerms).values({
      contractId,
      termType: "initial",
      termNumber: 0,
      termDate: String(signatureDate),
      startDate: String(startDate),
      endDate: String(endDate),
      reajustIndex: String(reajustIndex || "IPCA"),
      reajustPercent: "0.00",
      totalValue: totalValue.toFixed(2),
      installments: parsedInstallments,
      installmentValue: calculateInstallmentValue(totalValue, parsedInstallments).toFixed(2),
      notes: String(notes || ""),
    });

    const termId = Number((termInsert as any).insertId);

    for (const item of itemsCreated) {
      await db.insert(contractTermItems).values({
        termId,
        contractItemId: item.id,
        description: item.description,
        quantity: item.quantity,
        unitValue: item.unitValue,
        totalValue: item.totalValue,
      });
    }

    const createdContract = await db
      .select()
      .from(contracts)
      .where(eq(contracts.id, contractId));

    const createdTerm = await db
      .select()
      .from(contractTerms)
      .where(eq(contractTerms.id, termId));

    res.json({
      success: true,
      contract: createdContract[0],
      currentTerm: createdTerm[0],
      items: itemsCreated,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error?.message || "Erro ao criar contrato" });
  }
});

// CRIAR TERMO ADITIVO
app.post("/api/contracts/:id/terms", async (req, res) => {
  try {
    const contractId = Number(req.params.id);
    const { termDate, startDate, endDate, reajustIndex, reajustPercent, installments, notes } =
      req.body;

    if (!contractId) {
      return res.status(400).json({ error: "Contrato inválido" });
    }

    if (!termDate) {
      return res.status(400).json({ error: "Data do termo é obrigatória" });
    }

    if (!startDate) {
      return res.status(400).json({ error: "Vigência inicial é obrigatória" });
    }

    if (!endDate) {
      return res.status(400).json({ error: "Vigência final é obrigatória" });
    }

    const parsedInstallments = Number(installments);

    if (!parsedInstallments || parsedInstallments < 1 || parsedInstallments > 12) {
      return res
        .status(400)
        .json({ error: "A quantidade de parcelas deve ser entre 1 e 12" });
    }

    const contractResult = await db
      .select()
      .from(contracts)
      .where(eq(contracts.id, contractId));

    const contract = contractResult[0];

    if (!contract) {
      return res.status(404).json({ error: "Contrato não encontrado" });
    }

    const allTerms = await db
      .select()
      .from(contractTerms)
      .where(eq(contractTerms.contractId, contractId));

    const additiveTerms = allTerms.filter((term) => term.termType === "additive");
    const nextNumber = additiveTerms.length + 1;

    const activeItems = await db
      .select()
      .from(contractItems)
      .where(eq(contractItems.contractId, contractId));

    const percent = normalizeNumber(reajustPercent, 0);
    const factor = 1 + percent / 100;

    const recalculatedItems = activeItems.map((item) => {
      const unitValue = roundCurrency(Number(item.unitValue) * factor);
      const totalValue = calculateItemTotal(item.quantity, unitValue);

      return {
        contractItemId: item.id,
        description: item.description,
        quantity: item.quantity,
        unitValue,
        totalValue,
      };
    });

    const totalValue = roundCurrency(
      recalculatedItems.reduce((acc, item) => acc + item.totalValue, 0),
    );

    const termInsert = await db.insert(contractTerms).values({
      contractId,
      termType: "additive",
      termNumber: nextNumber,
      termDate: String(termDate),
      startDate: String(startDate),
      endDate: String(endDate),
      reajustIndex: String(reajustIndex || contract.reajustIndex),
      reajustPercent: percent.toFixed(2),
      totalValue: totalValue.toFixed(2),
      installments: parsedInstallments,
      installmentValue: calculateInstallmentValue(totalValue, parsedInstallments).toFixed(2),
      notes: String(notes || ""),
    });

    const termId = Number((termInsert as any).insertId);

    for (const item of recalculatedItems) {
      await db.insert(contractTermItems).values({
        termId,
        contractItemId: item.contractItemId,
        description: item.description,
        quantity: item.quantity,
        unitValue: item.unitValue.toFixed(2),
        totalValue: item.totalValue.toFixed(2),
      });
    }

    for (const item of recalculatedItems) {
      await db
        .update(contractItems)
        .set({
          unitValue: item.unitValue.toFixed(2),
          totalValue: item.totalValue.toFixed(2),
        })
        .where(eq(contractItems.id, item.contractItemId));
    }

    const createdTerm = await db
      .select()
      .from(contractTerms)
      .where(eq(contractTerms.id, termId));

    const createdTermItems = await db
      .select()
      .from(contractTermItems)
      .where(eq(contractTermItems.termId, termId));

    res.json({
      success: true,
      term: createdTerm[0],
      items: createdTermItems,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error?.message || "Erro ao criar termo aditivo" });
  }
});

export default app;

if (process.env.NODE_ENV !== "production") {
  app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
  });
}
