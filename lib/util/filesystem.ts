import { join } from "path";
import { readdirSync } from "fs";
import { handleRoute } from "@/util/routing";
import { Route } from "@/@types/router";

type DirectoryMap = string[][];

/**
 * Maps a directory to an array of strings representing the folder structure.
 * @param origin The base path for the folder to map.
 * @param paths The internal folder path to start the mapping at.
 * @returns A 2D array containing elements representing the file paths.
 */
const mapDirectory = (origin: string, ...paths: string[]): DirectoryMap => {
  const path = join(origin, ...paths);
  const sources = readdirSync(path, { withFileTypes: true });

  return sources.reduce((accumulator, source) => {
    const pathAsArray = [...paths, source.name];

    if (!source.isDirectory()) accumulator.push(pathAsArray);
    else accumulator.push(...mapDirectory(origin, ...pathAsArray));

    return accumulator;
  }, [] as DirectoryMap);
};

/**
 * Parses individual path elements into elements of a path route
 * for a router, turning strings like `"[userId]"` to `":userId"`, and
 * `"index.ts"` to `""`.
 * @param pathElement The path element to transform.
 * @returns The transformed string.
 */
const parsePathElement = (pathElement: string) => {
  const pathElementName = pathElement.replace(/(\.)(?!.*\.).*/g, "");
  const [, routeParameterName] = pathElement.match(/\[(.*?)\]/) || [];
  if (pathElementName === "index") return "";
  if (routeParameterName) return `:${routeParameterName}`;
  return pathElementName;
};

/**
 * Maps the provided origin and pathArray to a valid path string.
 * @param origin The entry point folder name.
 * @param pathArray The array of path elements.
 * @returns A valid path string to use on a router.
 */
const pathArrayToString = (origin: string, pathArray: string[]) => {
  const importPath = join(origin, ...pathArray);
  const getRoute = <T>() =>
    import(importPath).then(({ default: handler }) =>
      handleRoute(handler)
    ) as Promise<Route<T>>;

  const path =
    "/" +
    pathArray
      .reduce((accumulator, element) => {
        const pathElement = parsePathElement(element);
        if (pathElement) return [...accumulator, pathElement];
        return accumulator;
      }, [] as string[])
      .join("/");

  return { getRoute, path };
};

/**
 * Maps the provided directory to an object containing a function to
 * import as well as the pathname for the router..
 * @param origin The root directory for the routes.
 * @returns An array of objects containing import functions & route paths.
 */
export const mapDirectoryToRoutes = (origin: string) => {
  const directoryMap = mapDirectory(origin);
  return directoryMap.map((pathArray) => pathArrayToString(origin, pathArray));
};
