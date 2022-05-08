# 18h

18h is a wrapper for Koa which allows you to create Next.js-style, serverful dynamic API routing sourced from a directory of your choosing.

## Installation

```bash
npm i 18h
```

## Usage

```ts
/** /src/index.ts */

createRouter({
  routesFolder: join(__dirname, "routes"),
  port: 4000,
});
```

```ts
/** /src/routes/users/[userId]/delete.ts */

import { Route } from "18h";
import { deleteUserById } from "@/actions/users";
import { postRequestCleanupAction } from "@/example/ambiguous";

const handler: Route<{}, { success: boolean }, { userId: string }> = {
  method: "post",
  async handler(context) {
    const success = await deleteUserById(context.params.userId);

    return {
      headers: {
        "X-Custom-Header": "true",
      },
      body: { success },
      code: success ? 200 : 500,
    };
  },
  middleware: {
    post: [postRequestCleanupAction],
  },
};

export default handler;
```

```ts
import axios from "axios";

(async () => {
  const success = await axios
    .post("http://localhost:4000/users/123/delete")
    .then(({ data }) => data.success);

  console.log(success); // true;
})();
```

More details & documentation coming soon! 👊
