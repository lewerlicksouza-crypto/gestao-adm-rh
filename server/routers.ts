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

type VacationStatus = "Pendente" | "Aprovada" | "Rejeitada";

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
});

export type AppRouter = typeof appRouter;
