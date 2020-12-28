FROM node:lts-alpine

ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}
ENV SERVICE_HOST='0.0.0.0'

# Update and upgrade image packages
RUN apk -U upgrade

# Create unprivileged user to run app and prevent
# privilege escalation attacks
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /usr/src/app
RUN mkdir logs && chown -R appuser:appgroup logs
COPY . .
# If appropriate env file missing, use template
RUN cp .env.template .env.${NODE_ENV}
# git needed to install node modules from github
RUN apk add --no-cache git

RUN yarn install && yarn cache clean
USER appuser
CMD ["yarn", "start"]