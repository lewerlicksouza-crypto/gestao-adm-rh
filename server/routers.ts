import { publicProcedure, router } from "./trpc.js";

export const appRouter = router({
  system: router({
    ping: publicProcedure.query(() => {
      return {
        ok: true,
        message: "API tRPC online",
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
