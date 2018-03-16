FROM node:8-slim

ARG UID
ARG GID

RUN groupmod -g $GID node && \
    usermod -u $UID -g $GID node

WORKDIR /usr/src/app
USER node

CMD ["npm", "start"]
