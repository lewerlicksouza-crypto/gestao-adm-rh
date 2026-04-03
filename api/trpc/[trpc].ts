import { createHTTPHandler } from "@trpc/server/adapters/standalone";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { appRouter } from "../../server/routers";
import { createContext } from "../../server/context";

const handler = createHTTPHandler({
  router: appRouter,
  createContext,
  onError({ path, error }) {
    console.error(`[tRPC error] ${path ?? "<no-path>"}`, error);
  },
});

export default function vercelTrpcHandler(
  req: VercelRequest,
  res: VercelResponse,
) {
  return handler(req, res);
}
