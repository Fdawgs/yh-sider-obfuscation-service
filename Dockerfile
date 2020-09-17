FROM node:lts

WORKDIR /usr/app
COPY package.json .
COPY yarn.lock .
COPY .env.production .
COPY ./src ./src

# git needed to install node modules from github
RUN apt-get -y install git

RUN yarn install
CMD ["yarn", "start"]