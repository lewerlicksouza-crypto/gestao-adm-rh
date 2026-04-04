import { publicProcedure, router } from "./trpc.js";

let employeesMock = [
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
        const data = val as {
          fullName: string;
          email: string;
          phone: string;
          jobTitle: string;
          department: string;
        };

        if (!data.fullName || !data.email || !data.jobTitle) {
          throw new Error("Nome, email e cargo são obrigatórios.");
        }

        return data;
      })
      .mutation(({ input }) => {
        const newEmployee = {
          id: Date.now(),
          fullName: input.fullName,
          email: input.email,
          phone: input.phone ?? "",
          jobTitle: input.jobTitle,
          department: input.department ?? "",
          isActive: true,
        };

        employeesMock = [...employeesMock, newEmployee];

        return newEmployee;
      }),
  }),
});

export type AppRouter = typeof appRouter;
