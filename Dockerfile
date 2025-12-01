# For single docker image use this config also uses nginx
# for docker compose use Dockerfile.dev

# Args
ARG WORKING_DIR=app

# Image

FROM node:16.4.2-alpine 

RUN curl -f https://get.pnpm.io/v6.14.js | node - add --global pnpm

WORKDIR /${WORKING_DIR}

RUN npm i -g pnpm

# Add package.json and package.lock to container.
ADD package*.json .npmrc pnpm-lock.yaml ./

# install dependiencies in the docker container.
RUN pnpm install --frozen-lockfile --prod
RUN pnpm install
COPY . .

# Build Project
# RUN npm run build
CMD [ "npm","start" ]


# nginx -for reverse proxy and load balancing
# FROM nginx
EXPOSE 3000
# COPY ./docker/nginx.conf /etc/nginx/conf.d/default.conf
# COPY --from=builder /app/build /usr/share/nginx/html

