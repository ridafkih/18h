import { Route, ParameterizedContext } from "@/@types/router";

export const handleRoute = (route: Route) => {
  const handler = async (context: ParameterizedContext) => {
    const {
      body = {},
      code = 200,
      headers = {},
    } = await route.handler(context);

    for (const [key, value] of Object.entries(headers)) context.set(key, value);
    context.status = code;
    context.body = body;
  };

  return {
    method: route.method,
    handler,
  };
};
