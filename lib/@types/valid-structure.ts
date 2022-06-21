import { ZodFirstPartySchemaTypes, ZodNull } from "zod";

export type NonNullableValidStructure = Exclude<
  ZodFirstPartySchemaTypes,
  ZodNull
>;

export type ValidStructure = NonNullableValidStructure | ZodNull;
