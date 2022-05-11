import { RouteController } from "@/@types/route-controller";
import {
  ExtendedContext,
  RouteHandlerRules,
  MethodName,
} from "@/@types/http-method";

export const handleRoute = (controller: RouteController) => {
  return Object.entries(controller).map((controllerRule) => {
    const [method, rule] = controllerRule as [MethodName, RouteHandlerRules];

    const internalHandler = async (context: ExtendedContext) => {
      const {
        body = null,
        code = 200,
        headers = {},
      } = await rule.handler(context);

      const errors: string[] = (await rule.validation
        ?.validate(context.request?.body)
        .catch(({ errors }: { errors: string[] }) => errors)) as string[];

      if (errors?.length) {
        context.status = 400;
        (context as unknown as { body: object }).body = { errors };
        return;
      }

      context.status = code;
      (context as unknown as { body: object | unknown }).body = body;
      for (const [key, value] of Object.entries(headers))
        context.set(key, value.toString());
    };

    return { method, internalHandler, middleware: rule.middleware };
  });
};
