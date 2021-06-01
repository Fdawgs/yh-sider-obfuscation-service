FROM node:lts-alpine

# Workdir
WORKDIR /usr/app

# Copy and install packages
COPY . .
# Git is needed to install node modules from GitHub
RUN apk add --no-cache git=2.24.4-r0
RUN npm ci --ignore-scripts && npm cache clean --force

# Pre-emptively make logs directory if used for logs storage set 
# by LOG_ROTATION_FILENAME env variable 
RUN mkdir ./logs/ && chown -R node ./logs/

# Node images provide 'node' unprivileged user to run apps and prevent
# privilege escalation attacks
USER node
CMD ["node", "."]