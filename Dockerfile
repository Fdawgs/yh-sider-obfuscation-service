FROM node:lts-alpine

WORKDIR /usr/src/app
COPY . .
# If appropriate env file missing, use template
RUN cp .env.template .env
# git needed to install node modules from github
RUN apk add --no-cache git=2.24.3-r0

RUN yarn install && yarn cache clean

# Node images provide 'node' unprivileged user to run apps and prevent
# privilege escalation attacks
USER node
CMD ["yarn", "start"]