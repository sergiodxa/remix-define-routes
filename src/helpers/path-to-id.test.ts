import { describe, expect, test } from "bun:test";

import { pathToId } from "./path-to-id";

describe(pathToId.name, () => {
	describe.each(["", "admin", "tenant"])('pathToId with base "%s"', (base) => {
		test("index", () => {
			expect(pathToId("index", base)).toBe(`${base || "routes"}/_index`);
		});

		test("auth", () => {
			expect(pathToId("auth", base)).toBe(`${base || "routes"}/auth`);
		});

		test("auth/index", () => {
			expect(pathToId("auth/index", base)).toBe(
				`${base || "routes"}/auth._index`,
			);
		});

		test("auth/register", () => {
			expect(pathToId("auth/register", base)).toBe(
				`${base || "routes"}/auth.register`,
			);
		});

		test(":userId", () => {
			expect(pathToId(":userId", base)).toBe(`${base || "routes"}/$userId`);
		});

		test("users/:userId", () => {
			expect(pathToId("users/:userId", base)).toBe(
				`${base || "routes"}/users.$userId`,
			);
		});

		test("users/:userId/posts", () => {
			expect(pathToId("users/:userId/posts", base)).toBe(
				`${base || "routes"}/users.$userId.posts`,
			);
		});
	});
});
