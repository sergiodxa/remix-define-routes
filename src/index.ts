import type { ResolvedRemixConfig } from "@remix-run/dev";

import { applyLayout } from "./helpers/apply-layout.js";
import { isIndex } from "./helpers/is-index.js";
import { pathToId } from "./helpers/path-to-id.js";
import { removeIndex } from "./helpers/remove-index.js";
import { resolveExtension } from "./helpers/resolve-extension.js";

type RouteManifest = ResolvedRemixConfig["routes"];

type ConfigRoute = RouteManifest[string];

type RouteOptions = { file?: string; base?: string };

type RouteCallback = (args: DefineRoutesCallbackArgs) => void;

type RouteFunctionArgs = [] | [string] | [RouteOptions];

type RouteFunctionWithCallbackArgs =
	| RouteFunctionArgs
	| [RouteCallback]
	| [string, RouteCallback]
	| [RouteOptions, RouteCallback];

type CreateRouteFunctionArgs = {
	base?: string;
	layout?: string;
	parentId?: string;
};

function createRouteFunction({
	base = "routes",
	layout = "",
	parentId = "root",
}: CreateRouteFunctionArgs = {}) {
	return function route(path: string, ...args: RouteFunctionArgs): ConfigRoute {
		if (args.length === 0) {
			let id = pathToId(applyLayout(layout, path), base);
			return {
				path: removeIndex(path),
				id,
				file: resolveExtension(id),
				index: isIndex(path),
				parentId,
			};
		}

		if (args.length === 1 && typeof args[0] === "string") {
			let [file] = args;
			let id = pathToId(applyLayout(layout, path), base);
			return {
				path: removeIndex(path),
				id,
				file: resolveExtension(file),
				index: isIndex(path),
				parentId,
			};
		}

		if (args.length === 1 && typeof args[0] === "object") {
			let [{ file }] = args;
			let id = pathToId(applyLayout(layout, path), base);
			return {
				path: removeIndex(path),
				id,
				file: resolveExtension(file || id),
				index: isIndex(path),
				parentId,
			};
		}

		throw new Error("Invalid way to call `route`");
	};
}

type LayoutFunctionArgs =
	| [RouteCallback]
	| [CreateRouteFunctionArgs, RouteCallback]
	| [string, RouteCallback]
	| [string, CreateRouteFunctionArgs, RouteCallback];

interface DefineRoutesCallbackArgs {
	/**
	 * Define a route in the application. Each route has a path, based on the path
	 * there's an associated file, which can be customized.
	 *
	 * Each route can also work as a layout for other nested routes, keeping both
	 * the URL segment and the UI.
	 * @example
	 * route("about") // Renders at /about
	 * @example
	 * route("about", "landings/about")
	 * @example
	 * route("about", { file: "landings/about" })
	 * @example
	 * route("about", { base: "landings" })
	 * @example
	 * route("about", ({ route }) => {
	 *   route("team") // Renders at /about/team
	 * })
	 * @example
	 * route("about", { file: "landings/about" }, ({ route }) => {
	 *   route("team") // Renders at /about/team
	 * })
	 */
	route(path: string, ...args: RouteFunctionWithCallbackArgs): void;
	base(base: string, callback: RouteCallback): void;
	layout(path: string, ...args: LayoutFunctionArgs): void;
	extend(manifest: RouteManifest): void;
}

function createDefineRoutes({
	base = "routes",
	layout = "",
	parentId = "root",
}: CreateRouteFunctionArgs = {}) {
	return function defineRoutes(
		callback: (args: DefineRoutesCallbackArgs) => void,
	) {
		let routes: RouteManifest = {};

		let route = createRouteFunction({ base, layout: layout, parentId });

		callback({
			route(path: string, ...args: RouteFunctionWithCallbackArgs) {
				let argsWithoutCallback = args.filter(
					(arg) => typeof arg !== "function",
				) as RouteFunctionArgs;

				let config = route(path, ...argsWithoutCallback);
				routes[config.id] = { parentId: "root", ...config };

				if (args.length === 1 && typeof args[0] === "function") {
					let [callback] = args;
					let defineRoutes = createDefineRoutes({
						base,
						layout: config.path,
						parentId: config.id,
					});

					Object.assign(routes, defineRoutes(callback));
				}
			},

			base(base, callback) {
				let defineRoutes = createDefineRoutes({ base });
				Object.assign(routes, defineRoutes(callback));
			},

			layout(path, ...args) {
				let config: ConfigRoute;
				let callback: RouteCallback;

				if (args.length === 1) {
					[callback] = args;
					config = route(path);
				} else if (args.length === 2 && typeof args[0] === "object") {
					let [routeArgs, _callback] = args;
					callback = _callback;
					config = route(path, routeArgs);
				} else if (args.length === 2 && typeof args[0] === "string") {
					let [file, _callback] = args;
					callback = _callback;
					config = route(path, { file });
				} else if (args.length === 3) {
					let [file, routeArgs, _callback] = args;
					callback = _callback;
					config = route(path, { ...routeArgs, file });
				} else {
					throw new Error("Invalid way to call `layout`.");
				}

				routes[config.id] = { parentId: "root", ...config };

				let defineRoutes = createDefineRoutes({
					base,
					...args,
					layout: path,
					parentId: config.id,
				});

				Object.assign(routes, defineRoutes(callback));
			},

			extend(manifest) {
				Object.assign(routes, manifest);
			},
		});

		return routes;
	};
}

export const defineRoutes = createDefineRoutes();
