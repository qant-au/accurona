# syntax=docker/dockerfile:1.7
#
# Every Accurona, Axonometra and Reticulyne package installed from the npm
# registry, as a third party would, built into one page and served by nginx on 8080. There is no
# lockfile on purpose: each build resolves what is published now, so the
# image tests the public install, not a copy of this repo.

# Tag: node:22.22-alpine · Refreshed: 2026-09-29
# Refresh: docker buildx imagetools inspect node:22.22-alpine  (use the top-level Digest)
FROM node:22.22-alpine@sha256:e58326d0d441090181ac150dc2078d3e2cf6a0d42e809aebba3ef5880935ffdd AS build
WORKDIR /app
COPY package.json ./
# From registry.npmjs.org, with no token and no .npmrc.
RUN npm install --no-audit --no-fund --registry=https://registry.npmjs.org
COPY index.html vite.config.js ./
COPY src ./src
RUN npx vite build && npm ls --depth=0 > dist/installed.txt

# Tag: nginxinc/nginx-unprivileged:1.30-alpine · Refreshed: 2026-09-29
# Refresh: docker buildx imagetools inspect nginxinc/nginx-unprivileged:1.30-alpine  (use the top-level Digest)
FROM nginxinc/nginx-unprivileged:1.30-alpine@sha256:ed04ec1ff34502c339ee5c3ae3f855442398edc1d05591e2b98981dcbbd20b1e
COPY --chown=nginx:nginx docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build --chown=nginx:nginx /app/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:8080/ >/dev/null || exit 1
CMD ["nginx", "-g", "daemon off;"]
