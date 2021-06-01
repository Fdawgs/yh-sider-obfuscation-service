FROM node:lts-alpine

# Workdir
WORKDIR /usr/app

COPY . .

# Pre-emptively make logs directory if used for logs storage set 
# by LOG_ROTATION_FILENAME env variable 
RUN mkdir ./logs/ && chown -R node ./logs/
# If appropriate env file missing, use template
RUN cp .env.template .env
# Git is needed to install node modules from github
RUN apk add --no-cache git=2.24.4-r0
# Install dependencies
RUN npm ci --ignore-scripts && npm cache clean --force

# Node images provide 'node' unprivileged user to run apps and prevent
# privilege escalation attacks
USER node
CMD ["node", "."]