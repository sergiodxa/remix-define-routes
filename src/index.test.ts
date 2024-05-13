import { describe, expect, mock, test } from "bun:test";
import { defineRoutes } from ".";

// Mock node:fs to make existsSync return true always so we don't need the files
// in the test
mock.module("node:fs", () => {
	return {
		existsSync(path: string) {
			if (path.endsWith("/route.tsx") || path.endsWith("/route.ts")) {
				return false;
			}
			return true;
		},
	};
});

describe(defineRoutes.name, () => {
	let tenantRoutes = defineRoutes(({ layout }) => {
		layout(":tenant", { base: "tenant" }, ({ route }) => {
			route("/", "tenant/home");
			route("posts/:postId");
			route("users/:userId");
		});
	});

	let adminRoutes = defineRoutes(({ layout }) => {
		// Define the admin scope, move the base folder to app/admin
		layout("admin", { base: "admin" }, ({ route }) => {
			route("/", { file: "admin/home" }); // Redirect /admin to /admin/users
			route("users");
			route("posts");
		});
	});

	let debugRoutes = defineRoutes(({ base }) => {
		// Change the routes folder to app/debug
		base("debug", ({ route }) => {
			route("email");
			route("cache");
		});
	});

	let fullRoutes = defineRoutes(({ route, extend }) => {
		// Apply routes from other files or packages
		extend(tenantRoutes);
		extend(adminRoutes);
		extend(debugRoutes);
		// Overwrites /admin
		route("admin", "routes/admin/home");
		// Define / route
		route("/", "routes/home");
		route("users");
		route("posts/:postId");
		route("users/:userId", ({ route }) => {
			route("/", "routes/users.$userId._index");
			route("posts");
		});
		route("*", "routes/not-found");
	});

	test("tenant routes", () => {
		expect(tenantRoutes).toMatchSnapshot();
	});

	test("admin routes", () => {
		expect(adminRoutes).toMatchSnapshot();
	});

	test("debug routes", () => {
		expect(debugRoutes).toMatchSnapshot();
	});

	test("full routes", async () => {
		expect(fullRoutes).toMatchSnapshot();
	});
});
