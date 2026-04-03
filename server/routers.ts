import { publicProcedure, router } from "./trpc.js";

const employeesMock = [
  {
    id: 1,
    fullName: "Sebastião Expedito de Freitas Neto",
    email: "sebastiaofreitas@contasolucoes.com.br",
    phone: "(22) 3822-2919",
    jobTitle: "Programador",
    department: "Suprimentos",
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
  }),
});

export type AppRouter = typeof appRouter;
