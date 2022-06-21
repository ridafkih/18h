import { SomeZodObject, ZodArray, ZodNull, ZodString, ZodTypeAny } from "zod";

export type NonNullableValidStructure =
  | SomeZodObject
  | ZodArray<ZodTypeAny>
  | ZodString;

export type ValidStructure = NonNullableValidStructure | ZodNull;
