import Koa, { Context, Next } from "koa";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import { mapDirectoryToRoutes } from "@/util/filesystem";

import { ParameterizedContext, Route } from "@/@types/router";

interface CreateRouterParams {
  routesFolder: string;
  port: number;
  hostname?: string;
  middleware?: Koa.Middleware[];
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
  routesFolder,
  middleware = [],
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
    const middlewareChain = [...pre, handler, ...post].map((func) => {
      return async (context: ParameterizedContext<Context>, next: Next) => {
        await func(context, next);
				await next();
      };
    });

    router[method](path, ...middlewareChain);
  };

  for (const { getRoute, path } of mapDirectoryToRoutes(routesFolder))
    await getRoute().then((route: Route) => registerRoute(path, route));

  return new Promise<{ app: Koa; router: Router }>((resolve) => {
    app.listen(port, hostname, () => {
      resolve({ app, router });
    });
  });
};

export { Route };
