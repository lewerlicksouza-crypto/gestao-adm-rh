import { appRouter } from "../../server/routers.js";

export default function handler(req: any, res: any) {
  res.status(200).json({
    ok: true,
    imported: true,
    routerType: typeof appRouter,
  });
}
