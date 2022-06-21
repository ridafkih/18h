import { ZodFirstPartySchemaTypes, ZodNull } from "zod";

export type NonNullableValidStructure = ZodFirstPartySchemaTypes;

export type ValidStructure = NonNullableValidStructure | ZodNull;
