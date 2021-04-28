FROM node:14.2.0-alpine3.11 as build
WORKDIR /build
COPY backend/ ./backend
RUN cd backend && npm ci && npm run build

COPY frontend/ ./frontend
RUN cd frontend && npm ci && npm run build


FROM node:14.2.0-alpine3.11
WORKDIR /app

RUN ls -l /app
COPY --from=build /build/backend/server.bundle.js ./server.js
COPY --from=build /build/frontend/build ./static

EXPOSE 3001
WORKDIR /app
ENTRYPOINT ["node", "server.js"]