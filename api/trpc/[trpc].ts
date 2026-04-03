import { appRouter } from "../../server/routers.js";
import { createContext } from "../../server/context.js";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

export default function handler(req: any, res: any) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext,
  });
}
