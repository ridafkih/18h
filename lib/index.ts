import Koa from "koa";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import { mapDirectoryToRoutes } from "@/util/filesystem";

import { Route } from "@/@types/router";

interface CreateRouterParams {
  routeSourceFolder: string;
  middleware: Koa.Middleware[];
  port: number;
  hostname?: string;
}

/**
 * Creates a router at the specified port & hostname, sourcing
 * the routes from the provided `routeFolder` directory.
 * @param routeFolder The folder to map for paths.
 * @param port The port to host the server on.
 * @param hostname The hostname to host the server on.
 * @returns A promise which resolves with the `koa` app, and `koa-router` router objects.
 */
export const createRouter = async ({
  routeSourceFolder,
  middleware,
  port,
  hostname,
}: CreateRouterParams) => {
  const app = new Koa();
  const router = new Router();

  app.use(bodyParser());
  app.use(router.routes());
  middleware.forEach(app.use);

  const registerRoute = (
    path: string,
    { method, handler, middleware }: Route
  ) => {
    const { pre = [], post = [] } = middleware || {};
    router[method](path, ...pre, handler, ...post);
  };

  for (const { getRoute, path } of mapDirectoryToRoutes(routeSourceFolder))
    await getRoute().then((route: Route) => registerRoute(path, route));

  return new Promise<{ app: Koa; router: Router }>((resolve) => {
    app.listen(port, hostname, () => {
      resolve({ app, router });
    });
  });
};

export { Route };
