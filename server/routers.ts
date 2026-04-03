import { z } from "zod";
import { publicProcedure, router } from "./trpc";

type Employee = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  jobTitle: string;
  department: string;
  isActive: boolean;
};

type Vacation = {
  id: number;
  employeeId: number;
  employeeName: string;
  startDate: string;
  endDate: string;
  status: "pending" | "approved" | "rejected";
};

const employeesMock: Employee[] = [
  {
    id: 1,
    fullName: "Sebastião Expedito de Freitas Neto",
    email: "sebastiaofreitas@contasolucoes.com.br",
    phone: "(22) 3822-2919",
    jobTitle: "Consultor Técnico",
    department: "Tecnologia",
    isActive: true,
  },
];

const vacationsMock: Vacation[] = [
  {
    id: 1,
    employeeId: 1,
    employeeName: "Sebastião Expedito de Freitas Neto",
    startDate: "2026-04-15",
    endDate: "2026-05-14",
    status: "approved",
  },
];

export const appRouter = router({
  system: router({
    ping: publicProcedure.query(() => {
      return {
        ok: true,
        message: "API tRPC online",
        timestamp: new Date().toISOString(),
      };
    }),
  }),

  auth: router({
    me: publicProcedure.query(() => {
      return null;
    }),
    logout: publicProcedure.mutation(() => {
      return { success: true };
    }),
  }),

  employees: router({
    list: publicProcedure.query(() => {
      return employeesMock.filter((employee) => employee.isActive);
    }),

    getById: publicProcedure.input(z.number()).query(({ input }) => {
      return employeesMock.find((employee) => employee.id === input) ?? null;
    }),
  }),

  vacations: router({
    list: publicProcedure.query(() => {
      return vacationsMock;
    }),

    listByEmployee: publicProcedure
      .input(z.number())
      .query(({ input }) => {
        return vacationsMock.filter((vacation) => vacation.employeeId === input);
      }),
  }),
});

export type AppRouter = typeof appRouter;
