import { initTRPC, TRPCError } from "@trpc/server";
import type { TrpcContext } from "./context.js";

const t = initTRPC.context<TrpcContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Usuário não autenticado.",
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

const requireAdmin = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Usuário não autenticado.",
    });
  }

  if (ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Acesso restrito ao administrador.",
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);
export const adminProcedure = t.procedure.use(requireAdmin);
