FROM node:lts-alpine

ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}

# Update and upgrade packages
RUN apk -U upgrade

# Create unprivileged user to run app and prevent
# privilege escalation attacks
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /usr/app
RUN mkdir logs && chown -R appuser:appgroup logs
COPY package.json .
COPY yarn.lock .
COPY .env.${NODE_ENV} .
COPY ./src ./src

# git needed to install node modules from github
RUN apk add --no-cache git

RUN if [ "${NODE_ENV}" = "production" ] ; then yarn install --production ; else yarn install ; fi && yarn cache clean
USER appuser
CMD ["yarn", "start"]