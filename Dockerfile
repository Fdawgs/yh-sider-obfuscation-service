FROM node:18-alpine

# Workdir
WORKDIR /usr/app

# Install OS dependencies
# Curl needed for healthcheck command
# Git is needed to install node modules from GitHub
RUN apk add --no-cache curl git

# Copy and install node dependencies
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts --omit=dev && \
    npm pkg delete commitlint devDependencies jest nodemonConfig scripts && \
    npm cache clean --force

RUN apk del git

# Copy source
COPY . .

# Node images provide 'node' unprivileged user to run apps and prevent
# privilege escalation attacks
USER node
CMD ["node", "."]