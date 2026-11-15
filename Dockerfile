# syntax=docker/dockerfile:1

FROM node:20-alpine AS build
WORKDIR /app
ARG REACT_APP_DEMO_MODE=false
ENV REACT_APP_DEMO_MODE=${REACT_APP_DEMO_MODE}

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.27-alpine

COPY --chown=nginx:nginx --from=build /app/build /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh

USER nginx
EXPOSE 8080

CMD ["/bin/sh", "/docker-entrypoint.sh"]
