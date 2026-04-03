import type { IncomingMessage, ServerResponse } from "http";

export type AppUser = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
} | null;

export type TrpcContext = {
  req: IncomingMessage;
  res: ServerResponse;
  user: AppUser;
};

export async function createContext(opts: {
  req: IncomingMessage;
  res: ServerResponse;
}): Promise<TrpcContext> {
  return {
    req: opts.req,
    res: opts.res,
    user: null,
  };
}
