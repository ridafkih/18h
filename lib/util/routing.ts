import { RouteController } from "@/@types/route-controller";
import {
  ExtendedContext,
  HTTPMethodRules,
  MethodName,
} from "@/@types/http-method";

export const handleRoute = (controller: RouteController) => {
  return Object.entries(controller).map((controllerRule) => {
    const [method, rule] = controllerRule as [MethodName, HTTPMethodRules];

    const internalHandler = async (context: ExtendedContext) => {
      const {
        body = null,
        code = 200,
        headers = {},
      } = await rule.handler(context);

      const errors: string[] | null = await rule.validation
        ?.validate(context.request.body)
        .catch(({ errors }) => errors);

      if (errors?.length) {
        context.status = 400;
        (context as unknown as { body: object }).body = { errors };
        return;
      }

      context.status = code;
      (context as unknown as { body: object | null }).body = body;
      for (const [key, value] of Object.entries(headers))
        context.set(key, value.toString());
    };

    return { method, internalHandler, middleware: rule.middleware };
  });
};
