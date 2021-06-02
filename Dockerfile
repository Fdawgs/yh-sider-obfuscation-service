FROM node:16-alpine3.13

# Workdir
WORKDIR /usr/app

# Copy and install packages
COPY . .
# Git is needed to install node modules from GitHub
# Curl needed for healthcheck command
RUN apk add --no-cache git=2.30.2-r0 curl=7.77.0-r0 && \
    npm ci --ignore-scripts && npm cache clean --force

# Node images provide 'node' unprivileged user to run apps and prevent
# privilege escalation attacks
USER node
CMD ["node", "."]