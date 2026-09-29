# Security policy

## Supported versions

Accurona is pre-1.0, and breaking changes can happen between minor releases. Only the
latest release receives security fixes.

| Version | Supported |
| ------- | --------- |
| 0.1.x   | Yes       |
| < 0.1   | No        |

## Reporting a vulnerability

**Please do not open a public issue for a security report.** Use GitHub's private
vulnerability reporting instead:

<https://github.com/qant-au/accurona/security/advisories/new>

We aim to acknowledge a report within **7 days** and to ship a fix or mitigation within
**30 days** of confirming it. If you have not heard back, please follow up through the
maintainer's contact form at <https://adamburgess.me/contact>.

Please include:

- a clear description of the issue and its impact;
- steps to reproduce (the element id and the command you ran, if applicable);
- the release or commit SHA the report applies to;
- any proof-of-concept code or screenshots.

## In scope

- The element definitions and build scripts (`src/`, `scripts/`).
- The generated files other projects consume (`dist/manifest.json`, `dist/models.json`, `dist/plan/*.svg`): for example SVG content that could run script when inlined, or JSON that could break a consumer's parser.

## Out of scope

- How a consuming application renders these files; report that to the application's own repository.
- Vulnerabilities in development-only dependencies that do not ship in the build; these are tracked with `npm audit`, which also runs in CI.
- Self-XSS, for example pasting script into the browser's developer tools, or a file the user wrote themselves.

## Disclosure

We prefer coordinated disclosure. Once a fix is released we publish a GitHub security
advisory that credits the reporter, unless they ask to stay anonymous.
