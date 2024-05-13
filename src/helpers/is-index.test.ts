import { expect, test } from "bun:test";
import { isIndex } from "./is-index";

test("isIndex returns true", () => {
	expect(isIndex("index")).toBe(true);
	expect(isIndex("something/index")).toBe(true);
});

test("isIndex returns false", () => {
	expect(isIndex("something")).toBe(false);
});
