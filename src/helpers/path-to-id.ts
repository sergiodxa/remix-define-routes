import { join } from "node:path";

export function pathToId(path: string, base = "routes") {
	let result = path
		.replaceAll("/", ".")
		.replace("index", "_index")
		.replaceAll(":", "$");
	if (!base) return join("routes", result);
	return join(base, result);
}
