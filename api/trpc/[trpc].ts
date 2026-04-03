import { nodeHTTPRequestHandler } from "@trpc/server/adapters/node-http";
import { appRouter } from "../../server/routers.js";
import { createContext } from "../../server/context.js";

export default function handler(req: any, res: any) {
  const rawPath = req.query?.trpc;
  const path = Array.isArray(rawPath) ? rawPath.join("/") : rawPath ?? "";

  return nodeHTTPRequestHandler({
    req,
    res,
    path,
    router: appRouter,
    createContext: () => createContext({ req, res }),
    onError({ path, error }) {
      console.error(`tRPC error on ${path ?? "unknown"}:`, error);
    },
  });
}
