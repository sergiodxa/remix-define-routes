import { existsSync } from "node:fs";
import { resolve } from "node:path";

export function resolveExtension(file: string) {
	if (existsSync(resolve(`./app/${file}/route.tsx`))) {
		return `${file}/route.tsx`;
	}

	if (existsSync(resolve(`./app/${file}/route.ts`))) return `${file}/route.ts`;

	if (existsSync(resolve(`./app/${file}.tsx`))) return `${file}.tsx`;

	if (existsSync(resolve(`./app/${file}.ts`))) return `${file}.ts`;

	throw new Error(`File ${file} not found`);
}
