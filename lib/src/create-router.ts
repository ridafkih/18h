import Koa from "koa";
import Router from "koa-router";
import { mapDirectoryToRoutes } from "@/util/filesystem";
import { registerRoute } from "@/util/routes";
import type { Middleware } from "koa";
import { log } from "@/util/log";

interface CreateRouterOptions {
  routesFolder: string;
  port: number;
  hostname?: string;
  middleware?: Middleware[];
}

type CreateRouterOptionsFunction = (app: Koa) => CreateRouterOptions;

export const router = async (
  options: CreateRouterOptions | CreateRouterOptionsFunction
): Promise<{ app: Koa; router: Router }> => {
  const app = new Koa();
  const router = new Router();

  app.use((ctx, next) => {
    /** A debug logger middleware to log every request to console */
    log(`${ctx.method.toLowerCase()} ${ctx.path}`);
    return next();
  });

  const {
    routesFolder,
    port,
    hostname,
    middleware = [],
  } = typeof options === "function" ? options(app) : options;

  middleware.forEach((middlewareFunc) => app.use(middlewareFunc));
  app.use(router.routes());

  for (const { routes, path } of mapDirectoryToRoutes(routesFolder)) {
    const resolvedRoutes = await routes;
    await registerRoute(router, path, resolvedRoutes);
  }

  return new Promise((resolve) => {
    app.listen(port, hostname, () => {
      log(`listening on ${hostname}:${port}`);
      resolve({ app, router });
    });
  });
};
