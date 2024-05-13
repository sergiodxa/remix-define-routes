import { join } from "node:path";

export function applyLayout(layout: string, path: string) {
	if (layout === "") return path;
	if (path === "/") return layout;
	return join(layout, path);
}
