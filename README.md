# remix-define-routes

A DSL to define Remix routes with code.

## Setup

```bash
npm add remix-define-routes
```

Create a file called `routes.ts` in your Remix project.

```ts
import { defineRoutes } from "remix-define-routes";

let authRoutes = defineRoutes(({ layout }) => {
  layout("auth", { base: "routes/auth" }, ({ route }) => {
    route("index", "routes/auth._index");
    route("register");
    route("login");
  });
});

export default defineRoutes(({ route, extend }) => {
  extend(authRoutes);

  route("api/healthcheck");
  route("index", "routes/_index");
  route("admin/:resource");
});
```

Then in your `vite.config.ts` import and use it to configure your Remix plugin.

```ts
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

import routes from "./config/routes";

export default defineConfig({
  plugins: [
    remix({
      ignoredRouteFiles: ["**/*"],
      routes: () => routes,
    }),
  ],
});
```

And now you can use route routes file to define your application routes.
