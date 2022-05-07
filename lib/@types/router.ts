import { Context } from "koa";
import { HTTPMethod } from "@/@types/http"
import { Response } from "@/@types/response";

export type ParameterizedContext<T = {}> = Context & { params: T };

export type Route<Body = {}, Params = {}> = {
  method: HTTPMethod;
  handler: (context: ParameterizedContext<Params>) => Promise<Response<Body>>;
};
