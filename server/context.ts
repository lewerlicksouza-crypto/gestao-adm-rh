export type AppUser = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
} | null;

export type TrpcContext = {
  req: any;
  res: any;
  user: AppUser;
};

export async function createContext(opts: {
  req: any;
  res: any;
}): Promise<TrpcContext> {
  return {
    req: opts.req,
    res: opts.res,
    user: null,
  };
}
