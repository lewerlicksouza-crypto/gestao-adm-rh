import { createHTTPHandler } from "@trpc/server/adapters/standalone";
import { appRouter } from "../../server/routers";
import { createContext } from "../../server/context";

const handler = createHTTPHandler({
  router: appRouter,
  createContext,
  onError({ path, error }) {
    console.error(`tRPC failed on ${path ?? "unknown-path"}:`, error);
  },
});

export default async function handlerWrapper(req: any, res: any) {
  return handler(req, res);
}
