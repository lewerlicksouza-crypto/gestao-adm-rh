import { publicProcedure, router } from "./trpc.js";

type Employee = {
  id: number;
  fullName: string;
  cpf: string;
  email: string;
  phone: string;
  jobTitle: string;
  department: string;
  admissionDate: string;
  status: "Ativo" | "Inativo";
  notes: string;
};

type VacationStatus = "Programado" | "Aprovada" | "Rejeitada";

type VacationPeriod = {
  id: number;
  employeeId: number;
  periodNumber: number;
  start: string;
  end: string;
  totalDays: number;
  grantedUntil: string;
};

type VacationRecord = {
  id: number;
  employeeId: number;
  periodId: number;
  startDate: string;
  endDate: string;
  vacationDays: number;
  bonusDays: number;
  status: VacationStatus;
  notes: string;
};

type ReajustIndex = "IPCA" | "IGPM";
type ContractStatus = "Vigente" | "Encerrado";
type ContractTermType = "initial" | "additive";

type Contract = {
  id: number;
  contractNumber: string;
  year: number;
  clientName: string;
  cnpj: string;
  object: string;
  reajustIndex: ReajustIndex;
  signatureDate: string;
  status: ContractStatus;
  notes: string;
};

type ContractItem = {
  id: number;
  contractId: number;
  description: string;
  quantity: number;
  unitValue: number;
  totalValue: number;
  isActive: boolean;
};

type ContractTerm = {
  id: number;
  contractId: number;
  termType: ContractTermType;
  termNumber: number;
  termDate: string;
  startDate: string;
  endDate: string;
  reajustIndex: ReajustIndex;
  reajustPercent: number;
  totalValue: number;
  installments: number;
  installmentValue: number;
  notes: string;
};

type ContractTermItem = {
  id: number;
  termId: number;
  contractItemId: number;
  description: string;
  quantity: number;
  unitValue: number;
  totalValue: number;
};

type ContractAttachment = {
  id: number;
  contractId: number;
  termId?: number | null;
  fileName: string;
  fileUrl: string;
  fileType: string;
};

let employeesMock: Employee[] = [
  {
    id: 1,
    fullName: "Sebastião Expedito de Freitas Neto",
    cpf: "000.000.000-00",
    email: "sebastiaofreitas@contasolucoes.com.br",
    phone: "(22) 3822-2919",
    jobTitle: "Consultor Técnico",
    department: "Tecnologia",
    admissionDate: "2018-05-02",
    status: "Ativo",
    notes: "Funcionário ativo no setor técnico.",
  },
];

function parseIsoDate(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number) {
  const cloned = new Date(date);
  cloned.setDate(cloned.getDate() + days);
  return cloned;
}

function addYears(date: Date, years: number) {
  const cloned = new Date(date);
  cloned.setFullYear(cloned.getFullYear() + years);
  return cloned;
}

function getPeriodId(employeeId: number, periodNumber: number) {
  return employeeId * 1000 + periodNumber;
}

function generateVacationPeriodsForEmployee(
  employee: Employee,
  totalPeriods = 10,
): VacationPeriod[] {
  if (!employee.admissionDate) return [];

  const admissionDate = parseIsoDate(employee.admissionDate);

  return Array.from({ length: totalPeriods }, (_, index) => {
    const periodNumber = index + 1;

    const periodStart = addYears(admissionDate, index);
    const nextPeriodStart = addYears(admissionDate, index + 1);
    const periodEnd = addDays(nextPeriodStart, -1);

    const grantedUntil = addDays(addYears(periodEnd, 1), 0);

    return {
      id: getPeriodId(employee.id, periodNumber),
      employeeId: employee.id,
      periodNumber,
      start: formatIsoDate(periodStart),
      end: formatIsoDate(periodEnd),
      totalDays: 30,
      grantedUntil: formatIsoDate(grantedUntil),
    };
  });
}

function getAllVacationPeriods() {
  return employeesMock.flatMap((employee) =>
    generateVacationPeriodsForEmployee(employee),
  );
}

let vacationsMock: VacationRecord[] = [
  {
    id: 1001,
    employeeId: 1,
    periodId: getPeriodId(1, 5),
    startDate: "2024-01-10",
    endDate: "2024-01-24",
    vacationDays: 15,
    bonusDays: 0,
    status: "Aprovada",
    notes: "Primeira parte das férias do período 5.",
  },
];

function calculateEndDate(startDate: string, vacationDays: number) {
  const date = parseIsoDate(startDate);
  date.setDate(date.getDate() + vacationDays - 1);
  return formatIsoDate(date);
}

function getUsedDaysForPeriod(periodId: number, ignoreVacationId?: number) {
  return vacationsMock
    .filter(
      (vacation) =>
        vacation.periodId === periodId &&
        vacation.status !== "Rejeitada" &&
        vacation.id !== ignoreVacationId,
    )
    .reduce(
      (total, vacation) => total + vacation.vacationDays + vacation.bonusDays,
      0,
    );
}

function validateVacationInput(
  raw: any,
  currentVacationId?: number,
): Omit<VacationRecord, "id" | "endDate"> {
  const employeeId = Number(raw.employeeId);
  const periodId = Number(raw.periodId);
  const startDate = String(raw.startDate ?? "");
  const vacationDays = Number(raw.vacationDays);
  const bonusDays = Number(raw.bonusDays ?? 0);
  const status = String(raw.status ?? "Pendente") as VacationStatus;
  const notes = String(raw.notes ?? "");

  if (!employeeId) {
    throw new Error("Funcionário é obrigatório.");
  }

  if (!periodId) {
    throw new Error("Período é obrigatório.");
  }

  if (!startDate) {
    throw new Error("Data de início é obrigatória.");
  }

  if (![15, 20, 30].includes(vacationDays)) {
    throw new Error("Dias de férias devem ser 15, 20 ou 30.");
  }

  if (vacationDays === 20) {
    if (![0, 10].includes(bonusDays)) {
      throw new Error("Para 20 dias de férias, o abono só pode ser 0 ou 10.");
    }
  } else {
    if (bonusDays !== 0) {
      throw new Error(
        "Dias de abono só podem ser usados quando as férias forem de 20 dias.",
      );
    }
  }

  if (!["Pendente", "Aprovada", "Rejeitada"].includes(status)) {
    throw new Error("Status inválido.");
  }

  const employee = employeesMock.find((item) => item.id === employeeId);
  if (!employee) {
    throw new Error("Funcionário não encontrado.");
  }

  const period = getAllVacationPeriods().find((item) => item.id === periodId);
  if (!period) {
    throw new Error("Período não encontrado.");
  }

  if (period.employeeId !== employeeId) {
    throw new Error("O período selecionado não pertence ao funcionário.");
  }

  const usedDays = getUsedDaysForPeriod(periodId, currentVacationId);
  const requestedDays = vacationDays + bonusDays;

  if (usedDays + requestedDays > period.totalDays) {
    throw new Error(
      `Saldo insuficiente neste período. Restam ${
        period.totalDays - usedDays
      } dias disponíveis.`,
    );
  }

  return {
    employeeId,
    periodId,
    startDate,
    vacationDays,
    bonusDays,
    status,
    notes,
  };
}

// =========================
// CONTRATOS - MOCKS
// =========================

let contractsMock: Contract[] = [
  {
    id: 1,
    contractNumber: "001",
    year: 2026,
    clientName: "Município Exemplo",
    cnpj: "00.000.000/0001-00",
    object: "Licenciamento e manutenção de sistemas de gestão pública.",
    reajustIndex: "IPCA",
    signatureDate: "2026-01-01",
    status: "Vigente",
    notes: "",
  },
];

let contractItemsMock: ContractItem[] = [
  {
    id: 1,
    contractId: 1,
    description: "Sistema de Contabilidade",
    quantity: 1,
    unitValue: 1200,
    totalValue: 1200,
    isActive: true,
  },
  {
    id: 2,
    contractId: 1,
    description: "Sistema de Tesouraria",
    quantity: 1,
    unitValue: 800,
    totalValue: 800,
    isActive: true,
  },
];

let contractTermsMock: ContractTerm[] = [
  {
    id: 1,
    contractId: 1,
    termType: "initial",
    termNumber: 0,
    termDate: "2026-01-01",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    reajustIndex: "IPCA",
    reajustPercent: 0,
    totalValue: 2000,
    installments: 12,
    installmentValue: 166.67,
    notes: "Termo inicial do contrato.",
  },
];

let contractTermItemsMock: ContractTermItem[] = [
  {
    id: 1,
    termId: 1,
    contractItemId: 1,
    description: "Sistema de Contabilidade",
    quantity: 1,
    unitValue: 1200,
    totalValue: 1200,
  },
  {
    id: 2,
    termId: 1,
    contractItemId: 2,
    description: "Sistema de Tesouraria",
    quantity: 1,
    unitValue: 800,
    totalValue: 800,
  },
];

let contractAttachmentsMock: ContractAttachment[] = [];

function roundCurrency(value: number) {
  return Number(value.toFixed(2));
}

function calculateInstallmentValue(totalValue: number, installments: number) {
  return roundCurrency(totalValue / installments);
}

function calculateItemTotal(quantity: number, unitValue: number) {
  return roundCurrency(quantity * unitValue);
}

function getNextAdditiveNumber(contractId: number) {
  const additives = contractTermsMock.filter(
    (term) => term.contractId === contractId && term.termType === "additive",
  );

  return additives.length + 1;
}

function getContractCurrentTerm(contractId: number) {
  const terms = contractTermsMock
    .filter((term) => term.contractId === contractId)
    .sort((a, b) => {
      if (a.termType === "initial" && b.termType === "additive") return -1;
      if (a.termType === "additive" && b.termType === "initial") return 1;
      return a.termNumber - b.termNumber;
    });

  return terms[terms.length - 1] ?? null;
}

function validateContractInput(raw: any): Omit<Contract, "id"> {
  const contractNumber = String(raw.contractNumber ?? "").trim();
  const year = Number(raw.year);
  const clientName = String(raw.clientName ?? "").trim();
  const cnpj = String(raw.cnpj ?? "").trim();
  const object = String(raw.object ?? "").trim();
  const reajustIndex = String(raw.reajustIndex ?? "IPCA").trim() as ReajustIndex;
  const signatureDate = String(raw.signatureDate ?? "").trim();
  const status = String(raw.status ?? "Vigente").trim() as ContractStatus;
  const notes = String(raw.notes ?? "");

  if (!contractNumber) {
    throw new Error("Número do contrato é obrigatório.");
  }

  if (!year) {
    throw new Error("Ano do contrato é obrigatório.");
  }

  if (!clientName) {
    throw new Error("Nome do cliente/município é obrigatório.");
  }

  if (!cnpj) {
    throw new Error("CNPJ é obrigatório.");
  }

  if (!object) {
    throw new Error("Objeto do contrato é obrigatório.");
  }

  if (!["IPCA", "IGPM"].includes(reajustIndex)) {
    throw new Error("Índice de reajuste inválido.");
  }

  if (!signatureDate) {
    throw new Error("Data de assinatura é obrigatória.");
  }

  if (!["Vigente", "Encerrado"].includes(status)) {
    throw new Error("Status do contrato inválido.");
  }

  return {
    contractNumber,
    year,
    clientName,
    cnpj,
    object,
    reajustIndex,
    signatureDate,
    status,
    notes,
  };
}

function normalizeContractItems(rawItems: any[], contractId: number): ContractItem[] {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new Error("Informe pelo menos um item para o contrato.");
  }

  return rawItems.map((item, index) => {
    const description = String(item.description ?? "").trim();
    const quantity = Number(item.quantity ?? 1);
    const unitValue = Number(item.unitValue ?? 0);

    if (!description) {
      throw new Error(`Descrição do item ${index + 1} é obrigatória.`);
    }

    if (!quantity || quantity <= 0) {
      throw new Error(`Quantidade do item ${index + 1} deve ser maior que zero.`);
    }

    if (unitValue < 0) {
      throw new Error(`Valor unitário do item ${index + 1} é inválido.`);
    }

    return {
      id: Date.now() + index + Math.floor(Math.random() * 1000),
      contractId,
      description,
      quantity,
      unitValue: roundCurrency(unitValue),
      totalValue: calculateItemTotal(quantity, unitValue),
      isActive: true,
    };
  });
}

function validateTermInput(raw: any) {
  const termDate = String(raw.termDate ?? "").trim();
  const startDate = String(raw.startDate ?? "").trim();
  const endDate = String(raw.endDate ?? "").trim();
  const reajustIndex = String(raw.reajustIndex ?? "IPCA").trim() as ReajustIndex;
  const reajustPercent = Number(raw.reajustPercent ?? 0);
  const installments = Number(raw.installments);
  const notes = String(raw.notes ?? "");

  if (!termDate) {
    throw new Error("Data do termo é obrigatória.");
  }

  if (!startDate) {
    throw new Error("Vigência inicial é obrigatória.");
  }

  if (!endDate) {
    throw new Error("Vigência final é obrigatória.");
  }

  if (!["IPCA", "IGPM"].includes(reajustIndex)) {
    throw new Error("Índice de reajuste inválido.");
  }

  if (Number.isNaN(reajustPercent) || reajustPercent < 0) {
    throw new Error("Percentual de reajuste inválido.");
  }

  if (!installments || installments < 1 || installments > 12) {
    throw new Error("A quantidade de parcelas deve ser entre 1 e 12.");
  }

  return {
    termDate,
    startDate,
    endDate,
    reajustIndex,
    reajustPercent,
    installments,
    notes,
  };
}

export const appRouter = router({
  system: router({
    ping: publicProcedure.query(() => {
      return {
        ok: true,
        message: "API tRPC online",
      };
    }),
  }),

  employees: router({
    list: publicProcedure.query(() => {
      return employeesMock;
    }),

    create: publicProcedure
      .input((val) => {
        const data = val as Omit<Employee, "id">;

        if (
          !data.fullName ||
          !data.cpf ||
          !data.email ||
          !data.jobTitle ||
          !data.admissionDate
        ) {
          throw new Error(
            "Nome, CPF, email, cargo e data de admissão são obrigatórios.",
          );
        }

        return data;
      })
      .mutation(({ input }) => {
        const newEmployee: Employee = {
          id: Date.now(),
          fullName: input.fullName,
          cpf: input.cpf,
          email: input.email,
          phone: input.phone ?? "",
          jobTitle: input.jobTitle,
          department: input.department ?? "",
          admissionDate: input.admissionDate ?? "",
          status: input.status ?? "Ativo",
          notes: input.notes ?? "",
        };

        employeesMock = [...employeesMock, newEmployee];
        return newEmployee;
      }),

    update: publicProcedure
      .input((val) => {
        const data = val as Employee;

        if (
          !data.id ||
          !data.fullName ||
          !data.cpf ||
          !data.email ||
          !data.jobTitle ||
          !data.admissionDate
        ) {
          throw new Error(
            "ID, nome, CPF, email, cargo e data de admissão são obrigatórios.",
          );
        }

        return data;
      })
      .mutation(({ input }) => {
        const index = employeesMock.findIndex((employee) => employee.id === input.id);

        if (index === -1) {
          throw new Error("Funcionário não encontrado.");
        }

        employeesMock[index] = {
          ...employeesMock[index],
          ...input,
        };

        return employeesMock[index];
      }),

    delete: publicProcedure
      .input((val) => {
        const data = val as { id: number };

        if (!data.id) {
          throw new Error("ID do funcionário é obrigatório.");
        }

        return data;
      })
      .mutation(({ input }) => {
        const exists = employeesMock.some((employee) => employee.id === input.id);

        if (!exists) {
          throw new Error("Funcionário não encontrado.");
        }

        employeesMock = employeesMock.filter((employee) => employee.id !== input.id);
        vacationsMock = vacationsMock.filter(
          (vacation) => vacation.employeeId !== input.id,
        );

        return { success: true };
      }),
  }),

  vacationPeriods: router({
    list: publicProcedure.query(() => {
      return getAllVacationPeriods();
    }),
  }),

  vacations: router({
    list: publicProcedure.query(() => {
      return vacationsMock;
    }),

    create: publicProcedure
      .input((val) => validateVacationInput(val))
      .mutation(({ input }) => {
        const newVacation: VacationRecord = {
          id: Date.now(),
          ...input,
          endDate: calculateEndDate(input.startDate, input.vacationDays),
        };

        vacationsMock = [...vacationsMock, newVacation];
        return newVacation;
      }),

    update: publicProcedure
      .input((val) => {
        const raw = val as { id: number } & Record<string, unknown>;
        const id = Number(raw.id);

        if (!id) {
          throw new Error("ID das férias é obrigatório.");
        }

        const existing = vacationsMock.find((vacation) => vacation.id === id);
        if (!existing) {
          throw new Error("Registro de férias não encontrado.");
        }

        return {
          id,
          ...validateVacationInput(raw, id),
        };
      })
      .mutation(({ input }) => {
        const index = vacationsMock.findIndex((vacation) => vacation.id === input.id);

        if (index === -1) {
          throw new Error("Registro de férias não encontrado.");
        }

        vacationsMock[index] = {
          id: input.id,
          employeeId: input.employeeId,
          periodId: input.periodId,
          startDate: input.startDate,
          endDate: calculateEndDate(input.startDate, input.vacationDays),
          vacationDays: input.vacationDays,
          bonusDays: input.bonusDays,
          status: input.status,
          notes: input.notes,
        };

        return vacationsMock[index];
      }),

    delete: publicProcedure
      .input((val) => {
        const data = val as { id: number };

        if (!data.id) {
          throw new Error("ID das férias é obrigatório.");
        }

        return data;
      })
      .mutation(({ input }) => {
        const exists = vacationsMock.some((vacation) => vacation.id === input.id);

        if (!exists) {
          throw new Error("Registro de férias não encontrado.");
        }

        vacationsMock = vacationsMock.filter((vacation) => vacation.id !== input.id);

        return { success: true };
      }),
  }),

  contracts: router({
    list: publicProcedure.query(() => {
      return contractsMock.map((contract) => {
        const currentTerm = getContractCurrentTerm(contract.id);
        const items = contractItemsMock.filter((item) => item.contractId === contract.id);
        const activeItems = items.filter((item) => item.isActive);

        return {
          ...contract,
          currentTerm,
          items: activeItems,
        };
      });
    }),

    getById: publicProcedure
      .input((val) => {
        const data = val as { id: number };

        if (!data.id) {
          throw new Error("ID do contrato é obrigatório.");
        }

        return data;
      })
      .query(({ input }) => {
        const contract = contractsMock.find((item) => item.id === input.id);

        if (!contract) {
          throw new Error("Contrato não encontrado.");
        }

        const items = contractItemsMock.filter((item) => item.contractId === contract.id);
        const terms = contractTermsMock
          .filter((term) => term.contractId === contract.id)
          .sort((a, b) => {
            if (a.termType === "initial" && b.termType === "additive") return -1;
            if (a.termType === "additive" && b.termType === "initial") return 1;
            return a.termNumber - b.termNumber;
          });

        const attachments = contractAttachmentsMock.filter(
          (attachment) => attachment.contractId === contract.id,
        );

        const termItems = terms.map((term) => ({
          ...term,
          items: contractTermItemsMock.filter((item) => item.termId === term.id),
          attachments: attachments.filter((attachment) => attachment.termId === term.id),
        }));

        return {
          ...contract,
          items,
          terms: termItems,
          attachments: attachments.filter((attachment) => !attachment.termId),
          currentTerm: getContractCurrentTerm(contract.id),
        };
      }),

    create: publicProcedure
      .input((val) => {
        const raw = val as Record<string, unknown>;
        const contractData = validateContractInput(raw);
        const startDate = String(raw.startDate ?? "").trim();
        const endDate = String(raw.endDate ?? "").trim();
        const installments = Number(raw.installments);
        const notes = String(raw.notes ?? "");
        const items = Array.isArray(raw.items) ? raw.items : [];

        if (!startDate) {
          throw new Error("Vigência inicial é obrigatória.");
        }

        if (!endDate) {
          throw new Error("Vigência final é obrigatória.");
        }

        if (!installments || installments < 1 || installments > 12) {
          throw new Error("A quantidade de parcelas deve ser entre 1 e 12.");
        }

        return {
          ...contractData,
          startDate,
          endDate,
          installments,
          notes,
          items,
        };
      })
      .mutation(({ input }) => {
        const contractId = Date.now();
        const normalizedItems = normalizeContractItems(input.items, contractId);
        const totalValue = roundCurrency(
          normalizedItems.reduce((total, item) => total + item.totalValue, 0),
        );

        const newContract: Contract = {
          id: contractId,
          contractNumber: input.contractNumber,
          year: input.year,
          clientName: input.clientName,
          cnpj: input.cnpj,
          object: input.object,
          reajustIndex: input.reajustIndex,
          signatureDate: input.signatureDate,
          status: input.status,
          notes: input.notes ?? "",
        };

        const initialTermId = Date.now() + 1;

        const initialTerm: ContractTerm = {
          id: initialTermId,
          contractId,
          termType: "initial",
          termNumber: 0,
          termDate: input.signatureDate,
          startDate: input.startDate,
          endDate: input.endDate,
          reajustIndex: input.reajustIndex,
          reajustPercent: 0,
          totalValue,
          installments: input.installments,
          installmentValue: calculateInstallmentValue(totalValue, input.installments),
          notes: input.notes ?? "",
        };

        const initialTermItems: ContractTermItem[] = normalizedItems.map((item, index) => ({
          id: initialTermId + index + 1,
          termId: initialTermId,
          contractItemId: item.id,
          description: item.description,
          quantity: item.quantity,
          unitValue: item.unitValue,
          totalValue: item.totalValue,
        }));

        contractsMock = [...contractsMock, newContract];
        contractItemsMock = [...contractItemsMock, ...normalizedItems];
        contractTermsMock = [...contractTermsMock, initialTerm];
        contractTermItemsMock = [...contractTermItemsMock, ...initialTermItems];

        return {
          ...newContract,
          currentTerm: initialTerm,
          items: normalizedItems,
        };
      }),

    update: publicProcedure
      .input((val) => {
        const raw = val as Record<string, unknown>;
        const id = Number(raw.id);

        if (!id) {
          throw new Error("ID do contrato é obrigatório.");
        }

        return {
          id,
          ...validateContractInput(raw),
        };
      })
      .mutation(({ input }) => {
        const index = contractsMock.findIndex((contract) => contract.id === input.id);

        if (index === -1) {
          throw new Error("Contrato não encontrado.");
        }

        contractsMock[index] = {
          ...contractsMock[index],
          contractNumber: input.contractNumber,
          year: input.year,
          clientName: input.clientName,
          cnpj: input.cnpj,
          object: input.object,
          reajustIndex: input.reajustIndex,
          signatureDate: input.signatureDate,
          status: input.status,
          notes: input.notes,
        };

        return contractsMock[index];
      }),

    delete: publicProcedure
      .input((val) => {
        const data = val as { id: number };

        if (!data.id) {
          throw new Error("ID do contrato é obrigatório.");
        }

        return data;
      })
      .mutation(({ input }) => {
        const exists = contractsMock.some((contract) => contract.id === input.id);

        if (!exists) {
          throw new Error("Contrato não encontrado.");
        }

        const termIds = contractTermsMock
          .filter((term) => term.contractId === input.id)
          .map((term) => term.id);

        contractsMock = contractsMock.filter((contract) => contract.id !== input.id);
        contractItemsMock = contractItemsMock.filter((item) => item.contractId !== input.id);
        contractTermsMock = contractTermsMock.filter((term) => term.contractId !== input.id);
        contractTermItemsMock = contractTermItemsMock.filter(
          (item) => !termIds.includes(item.termId),
        );
        contractAttachmentsMock = contractAttachmentsMock.filter(
          (attachment) => attachment.contractId !== input.id,
        );

        return { success: true };
      }),
  }),

  contractItems: router({
    listByContract: publicProcedure
      .input((val) => {
        const data = val as { contractId: number };

        if (!data.contractId) {
          throw new Error("ID do contrato é obrigatório.");
        }

        return data;
      })
      .query(({ input }) => {
        return contractItemsMock.filter((item) => item.contractId === input.contractId);
      }),

    create: publicProcedure
      .input((val) => {
        const raw = val as Record<string, unknown>;
        const contractId = Number(raw.contractId);
        const description = String(raw.description ?? "").trim();
        const quantity = Number(raw.quantity ?? 1);
        const unitValue = Number(raw.unitValue ?? 0);

        if (!contractId) {
          throw new Error("Contrato é obrigatório.");
        }

        if (!description) {
          throw new Error("Descrição do item é obrigatória.");
        }

        if (!quantity || quantity <= 0) {
          throw new Error("Quantidade inválida.");
        }

        if (unitValue < 0) {
          throw new Error("Valor unitário inválido.");
        }

        return {
          contractId,
          description,
          quantity,
          unitValue,
        };
      })
      .mutation(({ input }) => {
        const contract = contractsMock.find((item) => item.id === input.contractId);

        if (!contract) {
          throw new Error("Contrato não encontrado.");
        }

        const newItem: ContractItem = {
          id: Date.now(),
          contractId: input.contractId,
          description: input.description,
          quantity: input.quantity,
          unitValue: roundCurrency(input.unitValue),
          totalValue: calculateItemTotal(input.quantity, input.unitValue),
          isActive: true,
        };

        contractItemsMock = [...contractItemsMock, newItem];

        return newItem;
      }),

    update: publicProcedure
      .input((val) => {
        const raw = val as Record<string, unknown>;
        const id = Number(raw.id);
        const description = String(raw.description ?? "").trim();
        const quantity = Number(raw.quantity ?? 1);
        const unitValue = Number(raw.unitValue ?? 0);
        const isActive = Boolean(raw.isActive ?? true);

        if (!id) {
          throw new Error("ID do item é obrigatório.");
        }

        if (!description) {
          throw new Error("Descrição do item é obrigatória.");
        }

        if (!quantity || quantity <= 0) {
          throw new Error("Quantidade inválida.");
        }

        if (unitValue < 0) {
          throw new Error("Valor unitário inválido.");
        }

        return {
          id,
          description,
          quantity,
          unitValue,
          isActive,
        };
      })
      .mutation(({ input }) => {
        const index = contractItemsMock.findIndex((item) => item.id === input.id);

        if (index === -1) {
          throw new Error("Item do contrato não encontrado.");
        }

        contractItemsMock[index] = {
          ...contractItemsMock[index],
          description: input.description,
          quantity: input.quantity,
          unitValue: roundCurrency(input.unitValue),
          totalValue: calculateItemTotal(input.quantity, input.unitValue),
          isActive: input.isActive,
        };

        return contractItemsMock[index];
      }),

    delete: publicProcedure
      .input((val) => {
        const data = val as { id: number };

        if (!data.id) {
          throw new Error("ID do item é obrigatório.");
        }

        return data;
      })
      .mutation(({ input }) => {
        const exists = contractItemsMock.some((item) => item.id === input.id);

        if (!exists) {
          throw new Error("Item do contrato não encontrado.");
        }

        contractItemsMock = contractItemsMock.filter((item) => item.id !== input.id);
        contractTermItemsMock = contractTermItemsMock.filter(
          (item) => item.contractItemId !== input.id,
        );

        return { success: true };
      }),
  }),

  contractTerms: router({
    listByContract: publicProcedure
      .input((val) => {
        const data = val as { contractId: number };

        if (!data.contractId) {
          throw new Error("ID do contrato é obrigatório.");
        }

        return data;
      })
      .query(({ input }) => {
        return contractTermsMock
          .filter((term) => term.contractId === input.contractId)
          .sort((a, b) => {
            if (a.termType === "initial" && b.termType === "additive") return -1;
            if (a.termType === "additive" && b.termType === "initial") return 1;
            return a.termNumber - b.termNumber;
          })
          .map((term) => ({
            ...term,
            items: contractTermItemsMock.filter((item) => item.termId === term.id),
          }));
      }),

    getById: publicProcedure
      .input((val) => {
        const data = val as { id: number };

        if (!data.id) {
          throw new Error("ID do termo é obrigatório.");
        }

        return data;
      })
      .query(({ input }) => {
        const term = contractTermsMock.find((item) => item.id === input.id);

        if (!term) {
          throw new Error("Termo não encontrado.");
        }

        return {
          ...term,
          items: contractTermItemsMock.filter((item) => item.termId === term.id),
          attachments: contractAttachmentsMock.filter(
            (attachment) => attachment.termId === term.id,
          ),
        };
      }),

    createAdditive: publicProcedure
      .input((val) => {
        const raw = val as Record<string, unknown>;
        const contractId = Number(raw.contractId);

        if (!contractId) {
          throw new Error("Contrato é obrigatório.");
        }

        return {
          contractId,
          ...validateTermInput(raw),
        };
      })
      .mutation(({ input }) => {
        const contract = contractsMock.find((item) => item.id === input.contractId);

        if (!contract) {
          throw new Error("Contrato não encontrado.");
        }

        const previousTerm = getContractCurrentTerm(input.contractId);

        if (!previousTerm) {
          throw new Error("Termo inicial não encontrado para este contrato.");
        }

        const nextNumber = getNextAdditiveNumber(input.contractId);
        const fatorReajuste = 1 + input.reajustPercent / 100;

        const contractItems = contractItemsMock.filter(
          (item) => item.contractId === input.contractId && item.isActive,
        );

        const newTermId = Date.now();

        const newTermItems: ContractTermItem[] = contractItems.map((item, index) => {
          const newUnitValue = roundCurrency(item.unitValue * fatorReajuste);
          const newTotalValue = calculateItemTotal(item.quantity, newUnitValue);

          return {
            id: newTermId + index + 1,
            termId: newTermId,
            contractItemId: item.id,
            description: item.description,
            quantity: item.quantity,
            unitValue: newUnitValue,
            totalValue: newTotalValue,
          };
        });

        const totalValue = roundCurrency(
          newTermItems.reduce((total, item) => total + item.totalValue, 0),
        );

        const newTerm: ContractTerm = {
          id: newTermId,
          contractId: input.contractId,
          termType: "additive",
          termNumber: nextNumber,
          termDate: input.termDate,
          startDate: input.startDate,
          endDate: input.endDate,
          reajustIndex: input.reajustIndex,
          reajustPercent: input.reajustPercent,
          totalValue,
          installments: input.installments,
          installmentValue: calculateInstallmentValue(totalValue, input.installments),
          notes: input.notes,
        };

        contractTermsMock = [...contractTermsMock, newTerm];
        contractTermItemsMock = [...contractTermItemsMock, ...newTermItems];

        // atualiza os itens principais para refletir o valor atual do contrato
        contractItemsMock = contractItemsMock.map((item) => {
          if (item.contractId !== input.contractId || !item.isActive) {
            return item;
          }

          const termItem = newTermItems.find((termItem) => termItem.contractItemId === item.id);

          if (!termItem) {
            return item;
          }

          return {
            ...item,
            unitValue: termItem.unitValue,
            totalValue: termItem.totalValue,
          };
        });

        return {
          ...newTerm,
          previousTerm,
          items: newTermItems,
        };
      }),

    update: publicProcedure
      .input((val) => {
        const raw = val as Record<string, unknown>;
        const id = Number(raw.id);

        if (!id) {
          throw new Error("ID do termo é obrigatório.");
        }

        return {
          id,
          ...validateTermInput(raw),
        };
      })
      .mutation(({ input }) => {
        const index = contractTermsMock.findIndex((term) => term.id === input.id);

        if (index === -1) {
          throw new Error("Termo não encontrado.");
        }

        contractTermsMock[index] = {
          ...contractTermsMock[index],
          termDate: input.termDate,
          startDate: input.startDate,
          endDate: input.endDate,
          reajustIndex: input.reajustIndex,
          reajustPercent: input.reajustPercent,
          installments: input.installments,
          installmentValue: calculateInstallmentValue(
            contractTermsMock[index].totalValue,
            input.installments,
          ),
          notes: input.notes,
        };

        return contractTermsMock[index];
      }),

    delete: publicProcedure
      .input((val) => {
        const data = val as { id: number };

        if (!data.id) {
          throw new Error("ID do termo é obrigatório.");
        }

        return data;
      })
      .mutation(({ input }) => {
        const term = contractTermsMock.find((item) => item.id === input.id);

        if (!term) {
          throw new Error("Termo não encontrado.");
        }

        if (term.termType === "initial") {
          throw new Error("O termo inicial não pode ser excluído.");
        }

        contractTermsMock = contractTermsMock.filter((item) => item.id !== input.id);
        contractTermItemsMock = contractTermItemsMock.filter(
          (item) => item.termId !== input.id,
        );
        contractAttachmentsMock = contractAttachmentsMock.filter(
          (attachment) => attachment.termId !== input.id,
        );

        return { success: true };
      }),
  }),

  contractAttachments: router({
    listByContract: publicProcedure
      .input((val) => {
        const data = val as { contractId: number };

        if (!data.contractId) {
          throw new Error("ID do contrato é obrigatório.");
        }

        return data;
      })
      .query(({ input }) => {
        return contractAttachmentsMock.filter(
          (attachment) => attachment.contractId === input.contractId,
        );
      }),

    create: publicProcedure
      .input((val) => {
        const raw = val as Record<string, unknown>;
        const contractId = Number(raw.contractId);
        const termId =
          raw.termId === null || raw.termId === undefined || raw.termId === ""
            ? null
            : Number(raw.termId);
        const fileName = String(raw.fileName ?? "").trim();
        const fileUrl = String(raw.fileUrl ?? "").trim();
        const fileType = String(raw.fileType ?? "arquivo").trim();

        if (!contractId) {
          throw new Error("Contrato é obrigatório.");
        }

        if (!fileName) {
          throw new Error("Nome do arquivo é obrigatório.");
        }

        if (!fileUrl) {
          throw new Error("URL do arquivo é obrigatória.");
        }

        return {
          contractId,
          termId,
          fileName,
          fileUrl,
          fileType,
        };
      })
      .mutation(({ input }) => {
        const contract = contractsMock.find((item) => item.id === input.contractId);

        if (!contract) {
          throw new Error("Contrato não encontrado.");
        }

        if (input.termId) {
          const term = contractTermsMock.find((item) => item.id === input.termId);

          if (!term) {
            throw new Error("Termo informado não encontrado.");
          }
        }

        const newAttachment: ContractAttachment = {
          id: Date.now(),
          contractId: input.contractId,
          termId: input.termId,
          fileName: input.fileName,
          fileUrl: input.fileUrl,
          fileType: input.fileType,
        };

        contractAttachmentsMock = [...contractAttachmentsMock, newAttachment];

        return newAttachment;
      }),

    delete: publicProcedure
      .input((val) => {
        const data = val as { id: number };

        if (!data.id) {
          throw new Error("ID do anexo é obrigatório.");
        }

        return data;
      })
      .mutation(({ input }) => {
        const exists = contractAttachmentsMock.some(
          (attachment) => attachment.id === input.id,
        );

        if (!exists) {
          throw new Error("Anexo não encontrado.");
        }

        contractAttachmentsMock = contractAttachmentsMock.filter(
          (attachment) => attachment.id !== input.id,
        );

        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
