FROM node:lts-alpine AS base
WORKDIR /app

COPY tools/docker-entrypoint.sh .
COPY services/helpers ./services/helpers

FROM base AS files
WORKDIR /app/services/files
COPY services/files ./
RUN npm install --omit=dev

FROM base AS gamesvc
WORKDIR /app/services/gamesvc
COPY services/gamesvc ./
RUN npm install --omit=dev

FROM base AS gateway
WORKDIR /app/services/gateway
COPY services/gateway ./
RUN npm install --omit=dev

FROM node:lts-alpine
WORKDIR /app

RUN apk update --no-cache && apk add --no-cache tini

COPY --from=files /app/services/files ./services/files
COPY --from=gamesvc /app/services/gamesvc ./services/gamesvc
COPY --from=gateway /app/services/gateway ./services/gateway
COPY --from=base /app/services/helpers ./services/helpers
COPY --from=base /app/docker-entrypoint.sh docker-entrypoint.sh

EXPOSE 8000 8001 8002

ENTRYPOINT [ "/sbin/tini", "--", "/app/docker-entrypoint.sh" ]
