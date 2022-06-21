import Koa from "koa";
import Router from "koa-router";
import { mapDirectoryToRoutes } from "@/util/filesystem";
import { registerRoute } from "@/util/routes";
import type { Middleware } from "koa";

interface CreateRouterOptions {
  routesFolder: string;
  port: number;
  hostname?: string;
  middleware?: Middleware[];
}

export const router = async ({
  routesFolder,
  middleware = [],
  port,
  hostname,
}: CreateRouterOptions) => {
  const app = new Koa();
  const router = new Router();

  app.use(router.routes());
  middleware.forEach(app.use);

  for (const { routes, path } of mapDirectoryToRoutes(routesFolder)) {
    const resolvedRoutes = await routes;
    await registerRoute(router, path, resolvedRoutes);
  }

  return new Promise((resolve) => {
    app.listen(port, hostname, () => {
      resolve({ app, router });
    });
  });
};
