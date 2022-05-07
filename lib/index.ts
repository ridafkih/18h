import Koa from "koa";
import Router from "koa-router";
import { mapDirectoryToRoutes } from "@/util/filesystem";

import { Route } from "@/@types/router";

/**
 * Creates a router at the specified port & hostname, sourcing
 * the routes from the provided `routeFolder` directory.
 * @param routeFolder The folder to map for paths.
 * @param port The port to host the server on.
 * @param hostname The hostname to host the server on.
 * @returns A promise which resolves with the `koa` app, and `koa-router` router objects.
 */
export const createRouter = async (
  routeFolder: string,
  port: number,
  hostname: string
) => {
  const app = new Koa();
  const router = new Router();

  app.use(router.routes());

  const registerRoute = (path: string, { method, handler }: Route) =>
    router[method](path, handler);

  for (const { getRoute, path } of mapDirectoryToRoutes(routeFolder))
    await getRoute().then((route) => registerRoute(path, route as Route));

  return new Promise((resolve) => {
    app.listen(port, hostname, () => {
      resolve({ app, router });
    });
  });
};

export { Route };
