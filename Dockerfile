# syntax=docker/dockerfile:1

FROM node:22-alpine AS build
WORKDIR /app
ARG REACT_APP_DEMO_MODE=false
ENV REACT_APP_DEMO_MODE=${REACT_APP_DEMO_MODE}

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.27-alpine

COPY --chown=root:root --chmod=0555 --from=build /app/build /usr/share/nginx/html
COPY --chown=root:root --chmod=0444 nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --chown=root:root --chmod=0444 docker-entrypoint.sh /usr/local/bin/frontend-entrypoint.sh

USER nginx
EXPOSE 8080

ENTRYPOINT ["/bin/sh"]
CMD ["/usr/local/bin/frontend-entrypoint.sh"]
