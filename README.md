<img src="https://i.imgur.com/jWLjU1R.png">

<h1 align="center">18h</h1>

<div align="center">
	<a href="https://npmjs.com/package/18h">
		<img src="https://badge.fury.io/js/18h.svg" alt="npm version" height="18">
	</a>
  <img src="https://img.shields.io/github/license/ridafkih/18h">
  <a href="https://github.com/ridafkih/">
	  <img src="https://img.shields.io/github/followers/ridafkih?logo=github&style=social&label=Follow">
  </a>
  <a href="https://twitter.com/ridafkih">
	  <img src="https://img.shields.io/twitter/follow/ridafkih?label=Follow">
  </a>
</div>

<br>

<div align="center">
	<a href="#installation">Installation</a>
	<span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
	<a href="#get-started">Get Started</a>
	<span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
	<a href="#examples">Examples</a>
	<span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
	<a href="#contributions">Contributions</a>
</div>

<hr>

<h2>What is 18h?</h2>
<p>18h is a Next.js-inspired Koa-router wrapper, which allows you to create routes that match the pattern of your filesystem. This speeds up iteration, while maintaining a serverful architecture.</p>
<p>This library is best used with Node.js & TypeScript in order to unlock all the type-safety capabilities it has to offer.</p>

<h2>Why is it named 18h?</h2>
<p>That is how long Koala's sleep, and all the cooler names were taken.</p>

<h2>Get Started</h2>
<p>Getting started is pretty snappy.</p>

<h3>Installation</h3>

<p>In order to install the package, in your root directory simply use your favourite package manager in order to install the package. It is registered on the NPM under the name <code>18h</code>.</p>

```bash
npm install 18h
```

<h3>Creating the Router</h3>
<p>First, using your favourite file manager, or the command line, create the folder in which your routes will be stored in. This folder will mirror the structure of your API.</p>

```bash
mkdir routes
```

<p>Once this is complete, we will be able to instantiate our router object by referencing this folder. It's best practice to use the Node.js <code>path</code> module, along with the global <code>__dirname</code> constant in order to ensure the application runs correctly once it is transpiled to JavaScript.</p>

```ts
import { join } from "path";
import { createRouter } from "18h";

createRouter({
  routesFolder: join(__dirname, "routes"),
  port: 4000,
  hostname: "localhost",
});
```

<p>We can also instantiate the 18h router with global middleware that will run prior to every API call.</p>

```ts
const logRequest = async (context, next) => {
  console.log(context);
  await next();
};

createRouter({
  // ...
  middleware: [logRequest],
});
```

<h3>Creating Routes</h3>
<p>Its important to remember that the structure of the filesystem within the routes folder you provide as the <code>routesFolder</code> key is going to mirror the structure of your URLs.</p>

<br>

> **Example**
>
> Assuming you provided a folder called `routes` as the `routesFolder` when creating your router object, creating a file at `routes/index.ts` it will allow consumers to interact with that endpoint at the `http://localhost/` URL.
>
> Creating a file called `routes/example.ts` will allow consumers to interact with that endpoint at the `http://localhost/example` URL.
>
> Creating a file called `routes/example/index.ts` will produce the same result as mentioned above.

> **Note**
>
> Placing square brackets `[]` around the entire name of a folder or file in the routes folder will allow for route parameters to be accepted through that endpoint.
>
> `/a/[b]/c` would become the endpoint path `/a/:b/c`.

<br>

The following file structure would generate the corresponding API endpoint structure.

<h4>File Structure</h4>

```
package.json
package-log.json
src/
├── routes/
│   ├── index.ts
│   ├── feed/
│   │   └── index.ts
│   ├── user/
│   │   ├── delete.ts
│   │   ├── index.ts
│   │   └── settings/
│   │       ├── private.ts
│   │       └── name.ts
│   ├── users/
│   │   └── [userId]/
│   │       ├── block.ts
│   │       ├── index.ts
│   │       └── follow.ts
│   └── posts/
│       ├── create.ts
│       ├── delete.ts
│       ├── index.ts
│       ├── like.ts
│       └── share.ts
└── index.ts
tsconfig.json
```

<h4>Resulting API Path Structure</h4>

```
/
/feed
/user/
/user/delete
/user/settings
/user/settings/private
/user/settings/name
/users/:userId
/users/:userId/block
/users/:userId/follow
/posts
/posts/create
/posts/delete
/posts/like
/posts/share
```

<h4>Adding Logic to Paths</h4>

<p>Of course, we want the paths to do <em>things</em> when someone interacts with them, that logic is defined in <code>RouteController</code> object, which takes multiple <code>MethodControllers</code> in which we define the logic of that endpoint.</p>

<p>Let's start off by creating the logic for the <code>/users/[userId]/block</code> endpoint so we can get a better feel for all the features.</p>

```ts
// src/routes/users/[userId]/block

import { RouteController, MethodController } from "18h";
import { object, string, StringSchema } from "yup";

import { checkIsAuthenticated, canUserBlockUser } from "@/example/ambiguous";

/**
 * We can define the structure of the response.
 */
type ResponseStructure = {
  success: boolean;
};

/**
 * Notice that the request body schema is defined
 * using types from the "yup" validation library.
 *
 * This is so that validation can occur, it will
 * resolve to the output type within the context
 * so we can still get type-safe usage.
 */
type RequestBodySchema = {
  reason: StringSchema;
};

/**
 * Since the API route uses a route parameter, that
 * being :userId, we can define that here.
 */
type RouteParameters = {
  userId: string;
};

const route: RouteController<
  {
    post: MethodController<ResponseStructure, RequestBodySchema>;
  },
  RouteParameters
> = {
  post: {
    /**
     * When a request body schema is present, you
     * must provide an array of accepted types, that
     * being "json", "form", or both.
     */
    accept: ["json"],
    /**
     * When a request body schema is present, you
     * must provide a "yup" data validation object schema.
     * This wil ensure data integrity, and reject it if not.
     */
    validation: object({
      reason: string().required("reason is required"),
    }),
    /**
     * You may provide an array of middleware. These are
     * to be asynchronous functions. `pre` middleware will
     * run before the handler, `post` will run after.
     */
    middleware: {
      pre: [checkIsAuthenticated, canUserBlockUser],
      post: [],
    },
    /**
     * The handler should be where the core logic is run,
     * and where the response is handled.
     *
     * The only required field in the return of the handler
     * function is the `body` *if* the response body structure
     * is defined.
     */
    async handler(context) {
      console.log(context.params.userId);
      const requestingUser = context.request.user;

      return {
        headers: {
          "x-user-id": requestedUser?.id,
        },
        body: { success },
        code: 200,
      };
    },
  },
};
```

<h2>Examples</h2>

We can create a simple endpoint that just responds with the node package version of the current project we're in. The endpoint will work on all HTTP methods, not just `GET`, but we could change it to do that by changing all occurances of `all` to `get`.

```ts
const { npm_package_version: version } = process.env;

type VersionResponseBody = {
  version?: string;
};

const controller: RouteController<{
  all: MethodController<VersionResponseBody>;
}> = {
    async handler(context) {
      return { body: { version } };
    },
  },
};

export default controller;
```

<h2>Contributions</h2>
Contributions are welcome! Happy hacking! 🎉
