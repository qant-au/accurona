# Verification

Every linework package, installed from the public npm registry as a third party
would, on one page:

- `@accurona/core` validates a scene and formats lengths,
- `@accurona/ui` draws a tool button that raises a notification,
- `@accurona/elements` supplies the plan drawings, and the diagram's icons,
- `@axonometra/editor` opens the scene's floor plan,
- `@reticulyne/editor` opens the same scene's network diagram.

The Docker image installs with no lockfile and no token, so each build tests what
is published now. It is served under a strict Content-Security-Policy (no
`'unsafe-eval'`, no `fetch()` of `data:`).

```sh
bash verify/restart.sh        # build from npm, serve on http://localhost:2224
node verify/check.mjs         # load it and check every package (Playwright)
```

This folder is not part of any published package.
