export function removeIndex(path: string) {
	if (path.endsWith("index")) return path.slice(0, -6);
	if (path.includes("index")) {
		throw new Error("Invalid path. Index must be the end of tha path");
	}
	return path;
}
