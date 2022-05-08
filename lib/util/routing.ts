import { Route, ParameterizedContext } from "@/@types/router";

export const handleRoute = (route: Route) => {
  const handler = async (context: ParameterizedContext) => {
    const {
      body = {},
      code = 200,
      headers = {},
    } = await route.handler(context);

    const errors: string[] | null = await route.validation
      ?.validate(context.request.body)
      .catch(({ errors }) => errors);

    if (errors?.length) {
      context.status = 400;
      context.body = { errors };
      return;
    }

    for (const [key, value] of Object.entries(headers)) context.set(key, value);
    context.status = code;
    context.body = body;
  };

  return {
    handler,
		middleware: route.middleware
  };
};
