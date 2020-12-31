# Yeovil District Hospital NHS Foundation Trust - SIDeR Contextual Link Obfuscation Service

[![GitHub Release](https://img.shields.io/github/release/Fdawgs/ydh-sider-obfuscation-service.svg)](https://github.com/Fdawgs/ydh-sider-obfuscation-service/releases/latest/) ![Build Status](https://github.com/Fdawgs/ydh-sider-obfuscation-service/workflows/CI/badge.svg?branch=master) [![Coverage Status](https://coveralls.io/repos/github/Fdawgs/ydh-sider-obfuscation-service/badge.svg?branch=master)](https://coveralls.io/github/Fdawgs/ydh-sider-obfuscation-service?branch=master) [![Known Vulnerabilities](https://snyk.io/test/github/Fdawgs/ydh-sider-obfuscation-service/badge.svg)](https://snyk.io/test/github/Fdawgs/ydh-sider-obfuscation-service) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

## Intro

This is [Yeovil District Hospital NHSFT](https://yeovilhospital.co.uk/)'s contextual link obfuscation service, a Node.js application using the [Fastify](https://www.fastify.io/) web framework and Black Pear's [obfuscated-querystring](https://github.com/BlackPearSw/obfuscated-querystring).

This service was created out of a need for query strings parameters containing personal identifiable data [to be obfuscated](https://github.com/Somerset-SIDeR-Programme/SIDeR-interop-patterns/wiki/query-string-obfuscation) when users click on the [SIDeR](https://www.somersetccg.nhs.uk/about-us/digital-projects/sider/) contextual link within Yeovil District Hospital NHSFT's Patient Administration System (PAS), InterSystems' TrakCare.

Single sign-on for a user using access tokens from a Keycloak server instance can be enabled using environment variables found in `.env.template`.

## Prerequisites

-   [Git](https://git-scm.com/) (to install non-registered dependencies)
-   [Node.js](https://nodejs.org/en/)
-   [Yarn](https://yarnpkg.com)

## Deployment

### Standard deployment

1. Navigate to the repo
2. Run `yarn install --production` to install dependencies
3. Make a copy of `.env.template` in the root directory and rename to `.env`
4. Configure the application using the environment variables in `.env`
5. Run `yarn start`

The service should now be up and running on the port set in the config. You should see the following output in stdout or the log file specified using the `LOG_ROTATION_FILENAME` environment variable:

```json
{
	"level": "info",
	"time": "2020-12-01T09:48:08.612Z",
	"pid": 41896,
	"hostname": "MYCOMPUTER",
	"msg": "Server listening at http://127.0.0.1:8204"
}
```

To quickly test it open a browser of your choice or, if using a request builder (i.e. [Insomnia](https://insomnia.rest/) or [Postman](https://www.postman.com/)) create a new GET request, and input the following URL:

http://127.0.0.1:8204/redirect?patient=https://fhir.nhs.uk/Id/nhs-number|9449304513&birthdate=1934-10-23&location=https://fhir.nhs.uk/Id/ods-organization-code|RA4&practitioner=https://sider.nhs.uk/auth|frazer.smith@ydh.nhs.uk

Replace the organization code and email address in the `location` and `practitioner` query string parameters respectively with your own if you have already been set up with an account in SIDeR.

In stdout or the log file you will see something similar to the following returned:

```json
{
	"level": "info",
	"time": "2020-12-01T10:37:32.133Z",
	"pid": 30700,
	"hostname": "MYCOMPUTER",
	"reqId": 3,
	"req": {
		"id": 3,
		"method": "GET",
		"url": "/redirect?patient=https%3A%2F%2Ffhir.nhs.uk%2FId%2Fnhs-number%7C9449304513&birthdate=1934-10-23&location=https%3A%2F%2Ffhir.nhs.uk%2FId%2Fods-organization-code%7CRA4&practitioner=https%3A%2F%2Fsider.nhs.uk%2Fauth%7Cfrazer.smith%40ydh.nhs.uk",
		"headers": {
			"host": "127.0.0.1:8204",
			"user-agent": "insomnia/2020.4.2",
			"accept": "*/*"
		},
		"remoteAddress": "127.0.0.1",
		"remotePort": 63213
	},
	"msg": "incoming request"
}
```

```json
{
	"level": "info",
	"time": "2020-12-01T10:37:32.135Z",
	"pid": 30700,
	"hostname": "MYCOMPUTER",
	"reqId": 3,
	"res": {
		"statusCode": 302,
		"headers": {
			"content-security-policy": "default-src 'self';base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests",
			"x-dns-prefetch-control": "off",
			"expect-ct": "max-age=0",
			"x-frame-options": "SAMEORIGIN",
			"strict-transport-security": "max-age=15552000; includeSubDomains",
			"x-download-options": "noopen",
			"x-content-type-options": "nosniff",
			"x-permitted-cross-domain-policies": "none",
			"referrer-policy": "no-referrer",
			"x-xss-protection": "0",
			"location": "https://pyrusapps.blackpear.com/esp/#!/launch?location=https%3A%2F%2Ffhir.nhs.uk%2FId%2Fods-organization-code%7CRA4&practitioner=https%3A%2F%2Fsider.nhs.uk%2Fauth%7Cfrazer.smith%40ydh.nhs.uk&enc=k01%7Ca6c12e7c5969ab5829a3f91ba02c302a0b4f598ad6c03709fbeeb52686a007c99f8b13add1472176b06f1471a0343f2d904d6f41c5776fa6d340834c8ebef92d41dcc164c6c8273854f404fd24b1ec8d4e6829c4a9b76aa08d8a5b63d806fb01",
			"content-length": "0"
		}
	},
	"responseTime": 1.764799952507019,
	"msg": "request completed"
}
```

Both the `patient` and `birthdate` query string parameters of the URL have been obfuscated in the generated redirect URL in `res.headers.location`.

The web browser or request builder used should be redirected to Black Pear's ESP site, and once logged in will provide the patient notes for the test patient with NHS Number 9449304513, success!

If the `patient`, `birthdate`, `location` or `practitioner` query string parameters are removed from the original URL the obfuscation process and redirect will not occur, and a 400 HTTP status code will be returned with the message similar to the following:

```json
{
	"statusCode": 400,
	"error": "Bad Request",
	"message": "querystring should have required property 'practitioner'"
}
```

Likewise, if the previously mentioned query string parameters do not adhere to the types expected, an error will also be returned.

As an example, providing `birthdate` in an invalid date format will return the following:

```json
{
	"statusCode": 400,
	"error": "Bad Request",
	"message": "querystring.birthdate should match format \"date\""
}
```

### Deploying using Docker

This requires [Docker](https://www.docker.com/products) installed.

1. Make a copy of `.env.template` in the root directory and rename to `.env`
2. Configure the application using the global variables in `.env`
3. Run `docker-compose up`

### Deploying using PM2

If you are unable to deploy this into production using Docker, it is recommended that you use a process manager such as [PM2](https://pm2.keymetrics.io/).

1. Navigate to the repo
2. Run `yarn install --production` to install dependencies
3. Make a copy of `.env.template` in the root directory and rename to `.env`
4. Configure the application using the global variables in `.env`
5. Run `yarn global add pm2` to install pm2 globally
6. Launch application with `pm2 start .pm2.config.js --env production`
7. Check the application has been deployed using `pm2 list` or `pm2 monit`

#### To install as a Windows service:

Yeovil District Hospital NHSFT is heavily entrenched in Microsoft's ecosystem; utilise [pm2-installer](https://github.com/jessety/pm2-installer) to easily install PM2 as a Windows service.

**Note:** PM2 has been configured to automatically restart the application if modifications are made to `.env`.

## Contributing

Please see [CONTRIBUTING.md](https://github.com/Fdawgs/ydh-sider-obfuscation-service/blob/master/CONTRIBUTING.md) for more details regarding contributing to this project.

## Acknowledgements

-   [**Mark Hunt**](https://github.com/nhsbandit) - Keycloak single sign-on access tokens integration and testing
-   [**Will Jehring**](https://github.com/wjehring) - Query string obfuscation, redirect testing, and Keycloak testing

## License

`ydh-sider-obfuscation-service` is licensed under the [MIT](https://github.com/Fdawgs/ydh-sider-obfuscation-service/blob/master/LICENSE) license.
