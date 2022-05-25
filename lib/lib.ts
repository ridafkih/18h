import { validation } from ".";
import { method } from "./src/create-method";
import { route } from "./src/create-route";

route<{ a: string }>({
  get: method({
    schema: {
      request: validation.object({ string: validation.string() }),
      response: validation.null(),
    },
    accepts: ["json"],
    async handler(context) {
      context.request.body.string;
      return {};
    },
  }),
});
