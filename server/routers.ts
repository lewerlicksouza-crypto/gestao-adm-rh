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

let employeesMock: Employee[] = [
  {
    id: 1,
    fullName: "Sebastião Expedito de Freitas Neto",
    cpf: "000.000.000-00",
    email: "sebastiaofreitas@contasolucoes.com.br",
    phone: "(22) 3822-2919",
    jobTitle: "Consultor Técnico",
    department: "Tecnologia",
    admissionDate: "2024-01-15",
    status: "Ativo",
    notes: "Funcionário ativo no setor técnico.",
  },
];

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

        if (!data.fullName || !data.cpf || !data.email || !data.jobTitle) {
          throw new Error("Nome, CPF, email e cargo são obrigatórios.");
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
  }),
});

export type AppRouter = typeof appRouter;
