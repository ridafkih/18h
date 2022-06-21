import bodyParser from "koa-bodyparser";

export const getParsingMiddleware = (accepts: string[]) => {
  return accepts.length
    ? [
        bodyParser({
          enableTypes: accepts,
          onerror: (_error, context) => context.throw(422),
        }),
      ]
    : [];
};
