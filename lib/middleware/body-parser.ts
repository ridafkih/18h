import { Context, Next } from "koa";
import bodyParser from "koa-bodyparser";

export const handleParseError = () => {
  return (context: Context, next: Next) => {
    next().catch((error: Error) => {
      if (!(error instanceof SyntaxError)) return;
      context.throw(500);
    });
  };
};

export const parseBody = bodyParser;
