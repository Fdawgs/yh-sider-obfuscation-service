# Yeovil District Hospital - SIDeR Contextual Link Obfuscation Service - Fastify web framework TEST REPO

[![GitHub Release](https://img.shields.io/github/release/Fdawgs/fastify-sider-obs.svg)](https://github.com/Fdawgs/fastify-sider-obs/releases/latest/) ![Build Status](https://github.com/Fdawgs/fastify-sider-obs/workflows/Node.js%20CI/badge.svg?branch=master) [![Coverage Status](https://coveralls.io/repos/github/Fdawgs/fastify-sider-obs/badge.svg?branch=master)](https://coveralls.io/github/Fdawgs/fastify-sider-obs?branch=master) [![Known Vulnerabilities](https://snyk.io/test/github/Fdawgs/fastify-sider-obs/badge.svg)](https://snyk.io/test/github/Fdawgs/fastify-sider-obs) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

## Intro

This is a **test repo** to look at migrating Yeovil District Hospital's contextual link obfuscation service from the Express web framework to the Fastify one.

## Prerequisites

-   [Git](https://git-scm.com/) (to install non-registered dependencies)
-   [Node.js](https://nodejs.org/en/)
-   [Yarn](https://yarnpkg.com)

## Deployment

### Standard deployment

1. Navigate to the repo
2. Run `yarn install` to install dependencies
3. Make a copy of `.env.template` in the root directory and rename to `.env.production`
4. Configure the application using the global variables in `.env.production`
5. Run `yarn start`

The Express server should now be up and running on the port set in the config. You should see the following output:

```json
{"level":30,"time":1605282277689,"pid":14024,"hostname":"MYCOMPUTER","msg":"Server listening at http://127.0.0.1:8204"}
```

To quickly test it open a browser of your choice or, if using a request builder (i.e. Insomnia or Postman) create a new GET request, and input the following URL:

http://0.0.0.0:8204?patient=https://fhir.nhs.uk/Id/nhs-number|9467335646&birthdate=1932-04-15&location=https://fhir.nhs.uk/Id/ods-organization-code|RA4&practitioner=https://sider.nhs.uk/auth|frazer.smith@ydh.nhs.uk

Swap out the organization code and email address with your own if you have already been set up an account on the eSP.

In the CLI you will see something similar to the following returned:

```
{"level":30,"time":1605282628344,"pid":24868,"hostname":"MYCOMPUTER","reqId":1,"req":{"method":"GET","url":"/?patient=https%3A%2F%2Ffhir.nhs.uk%2FId%2Fnhs-number%7C9467335646&birthdate=1932-04-15&location=https%3A%2F%2Ffhir.nhs.uk%2FId%2Fods-organization-code%7CRA4&practitioner=https%3A%2F%2Fsider.nhs.uk%2Fauth%7Cfrazer.smith%40ydh.nhs.uk","hostname":"127.0.0.1:8204","remoteAddress":"127.0.0.1","remotePort":52306},"msg":"incoming request"}        
https://pyrusapps.blackpear.com/esp/#!/launch?location=https%3A%2F%2Ffhir.nhs.uk%2FId%2Fods-organization-code%7CRA4&practitioner=https%3A%2F%2Fsider.nhs.uk%2Fauth%7Cfrazer.smith%40ydh.nhs.uk&enc=k01%7Ccab5a062bddbae5fb8457afc7b0295689a28c1a734d41de9dd061dfb85457014386e203d7d50a8622a98813bed9cf167a9e0e59dcc5275a78b9b8278d752d8794d473b1346a7069732bb7bbe318e3b006cff27a965ce7f48f4e01e36080e4e0b
{"level":30,"time":1605282628509,"pid":24868,"hostname":"MYCOMPUTER","reqId":1,"res":{"statusCode":302},"responseTime":164.61810000240803,"msg":"request completed"}
```

Both the patient and birthdate query parameters of the URL have been obfuscated.

The web browser or request builder used should be redirected to Black Pear's ESP site, and once logged in will provide the patient note's for the test patient with NHS Number 9467335646, success!

If the patient, birthdate, location or practitioner parameters are removed from the original URL the obfuscation process and redirect will not occur, and a status 400 will be returned with the message "An essential parameter is missing".

### Deploying using Docker

This requires [Docker](https://www.docker.com/products) installed.

1. Make a copy of `.env.template` in the root directory and rename to `.env.production`
2. Configure the application using the global variables in `.env.production`
3. Run `docker-compose up`

### Deploying using PM2

It is [recommended](https://expressjs.com/en/advanced/pm.html) that you use a process manager such as [PM2](https://pm2.keymetrics.io/) when deploying Express applications like this into production.

1. Navigate to the repo
2. Run `yarn install` to install dependencies
3. Make a copy of `.env.template` in the root directory and rename to `.env.production`
4. Configure the application using the global variables in `.env.production`
5. Run `yarn global add pm2` to install pm2 globally
6. Launch application with `pm2 start .pm2.config.js --env production`
7. Check the application has been deployed using `pm2 list` or `pm2 monit`

#### To install as a Windows service:

Yeovil District Hospital is heavily invested in Microsoft's ecosystem; utilise [pm2-installer](https://github.com/jessety/pm2-installer) to easily install PM2 as a Windows service.

**Note:** PM2 has been configured to automatically restart the application if modifications are made to `.env.development` or `.env.production`.

## Contributing

Please see [CONTRIBUTING.md](https://github.com/Fdawgs/fastify-sider-obs/blob/master/CONTRIBUTING.md) for more details regarding contributing to this project.

## License

`fastify-sider-obs` is licensed under the [MIT](https://github.com/Fdawgs/fastify-sider-obs/blob/master/LICENSE) license.
