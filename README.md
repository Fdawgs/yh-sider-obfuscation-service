<a href="https://yeovilhospital.co.uk/">
	<img alttext="Yeovil District Hospital Logo" src="https://github.com/Fdawgs/ydh-logos/raw/HEAD/images/ydh-full-logo-transparent-background.svg" width="480" />
</a>

# Yeovil District Hospital NHS Foundation Trust - SIDeR Contextual Link Obfuscation Service

[![GitHub Release](https://img.shields.io/github/release/Fdawgs/ydh-sider-obfuscation-service.svg)](https://github.com/Fdawgs/ydh-sider-obfuscation-service/releases/latest/)
![Build Status](https://github.com/Fdawgs/ydh-sider-obfuscation-service/workflows/CI/badge.svg?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/Fdawgs/ydh-sider-obfuscation-service/badge.svg?branch=master)](https://coveralls.io/github/Fdawgs/ydh-sider-obfuscation-service?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/Fdawgs/ydh-sider-obfuscation-service/badge.svg)](https://snyk.io/test/github/Fdawgs/ydh-sider-obfuscation-service)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat)](https://github.com/prettier/prettier)

> Yeovil District Hospital NHSFT's SIDeR Contextual Link Obfuscation Service

## Intro

This is [Yeovil District Hospital NHSFT](https://yeovilhospital.co.uk/)'s contextual link obfuscation service, a Node.js application using the [Fastify](https://www.fastify.io/) web framework and Black Pear's [obfuscated-querystring](https://github.com/BlackPearSw/obfuscated-querystring).

This service was created out of a need for query strings parameters containing personally identifiable data [to be obfuscated](https://github.com/Somerset-SIDeR-Programme/SIDeR-interop-patterns/wiki/query-string-obfuscation) when users click on the [SIDeR](https://www.somersetccg.nhs.uk/about-us/digital-projects/sider/) contextual link within Yeovil District Hospital NHSFT's Patient Administration System (PAS), InterSystems TrakCare.

A video demonstrating the contextual link in action can be found [here](./docs/videos/).

Single sign-on for a user using access tokens from a Keycloak server instance can be enabled using environment variables found in `.env.template`.

## Prerequisites

-   [Git](https://git-scm.com/) (to install non-registered dependencies)
-   [Node.js](https://nodejs.org/en/)

## Setup

Perform the following steps before deployment:

1. Clone the repo
2. Navigate to the project directory
3. Run `npm install --ignore-scripts --production` to install dependencies
4. Make a copy of `.env.template` in the root directory and rename it to `.env`
5. Configure the application using the environment variables in `.env`

**Note:** Set the following environment variables in `.env` to meet NHS Digital's recommendation to retain 6 months' worth of logs:

-   `LOG_ROTATION_DATE_FORMAT="YYYY-MM-DD"`
-   `LOG_ROTATION_FREQUENCY="daily"`
-   `LOG_ROTATION_MAX_LOGS="180"`

## Deployment

### Standard Deployment

1. Run `npm start`

The service should now be up and running on the port set in the config. You should see the following output in stdout or the log file specified using the `LOG_ROTATION_FILENAME` environment variable:

```json
{
	"level": "info",
	"time": "2021-10-05T08:12:51.571Z",
	"pid": 63372,
	"hostname": "MYCOMPUTER",
	"msg": "Server listening at http://[::]:8204"
}
```

To quickly test it open a browser of your choice or, if using a request builder (i.e. [Insomnia](https://insomnia.rest/) or [Postman](https://www.postman.com/)) create a new GET request, and input the following URL:

http://0.0.0.0:8204/redirect?patient=https://fhir.nhs.uk/Id/nhs-number|9449304513&birthdate=1934-10-23&location=https://fhir.nhs.uk/Id/ods-organization-code|RA4&practitioner=https://sider.nhs.uk/auth|frazer.smith@ydh.nhs.uk

Replace the organization code and email address in the `location` and `practitioner` query string parameters respectively with your own if you have already been set up with an account in SIDeR.

In stdout, or the log file, you will see something similar to the following returned:

```json
{
	"level": "info",
	"time": "2021-10-05T08:14:13.556Z",
	"pid": 63372,
	"hostname": "MYCOMPUTER",
	"reqId": "req-1",
	"req": {
		"id": "req-1",
		"method": "GET",
		"url": "/redirect?patient=https%3A%2F%2Ffhir.nhs.uk%2FId%2Fnhs-number%7C9449304513&birthdate=1934-10-23&location=https%3A%2F%2Ffhir.nhs.uk%2FId%2Fods-organization-code%7CRA4&practitioner=https%3A%2F%2Fsider.nhs.uk%2Fauth%7Cfrazer.smith%40ydh.nhs.uk",
		"headers": {
			"host": "localhost:8204",
			"user-agent": "insomnia/2021.5.3",
			"accept": "text/html",
			"accept-encoding": "br, gzip, deflate"
		},
		"remoteAddress": "::1",
		"remotePort": 59239
	},
	"msg": "incoming request"
}
```

```json
{
	"level": "info",
	"time": "2021-10-05T08:14:13.586Z",
	"pid": 63372,
	"hostname": "MYCOMPUTER",
	"reqId": "req-1",
	"res": {
		"statusCode": 302,
		"headers": {
			"content-security-policy": "default-src 'self';base-uri 'self';img-src 'self' data:;object-src 'none';child-src 'self';frame-ancestors 'none';form-action 'self';upgrade-insecure-requests;block-all-mixed-content",
			"x-dns-prefetch-control": "off",
			"expect-ct": "max-age=0",
			"x-frame-options": "SAMEORIGIN",
			"strict-transport-security": "max-age=31536000; includeSubDomains",
			"x-download-options": "noopen",
			"x-content-type-options": "nosniff",
			"x-permitted-cross-domain-policies": "none",
			"referrer-policy": "no-referrer",
			"x-xss-protection": "0",
			"surrogate-control": "no-store",
			"cache-control": "no-store, max-age=0, must-revalidate",
			"pragma": "no-cache",
			"expires": "0",
			"permissions-policy": "interest-cohort=()",
			"vary": "Origin",
			"x-ratelimit-limit": 1000,
			"x-ratelimit-remaining": 999,
			"x-ratelimit-reset": 60,
			"location": "https://pyrusapps.blackpear.com/esp/#!/launch?location=https%3A%2F%2Ffhir.nhs.uk%2FId%2Fods-organization-code%7CRA4&practitioner=https%3A%2F%2Fsider.nhs.uk%2Fauth%7Cfrazer.smith%40ydh.nhs.uk&enc=k01%7Ca6c12e7c5969ab5829a3f91ba02c302a0b4f598ad6c03709fbeeb52686a007c99f8b13add1472176b06f1471a0343f2d904d6f41c5776fa6d340834c8ebef92d41dcc164c6c8273854f404fd24b1ec8d4e6829c4a9b76aa08d8a5b63d806fb01",
			"content-length": "0"
		}
	},
	"responseTime": 27.195500135421753,
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

#### OpenAPI Specification

The OpenAPI v3.x.x specification for this service is found at `/docs/json`.

### Deploying Using Docker

This requires [Docker](https://www.docker.com/products) installed.

1. Run `docker compose up` (or `docker compose up -d` to run in background)

### Deploying Using PM2

If you are unable to deploy this into production using Docker, it is recommended that you use a process manager such as [PM2](https://pm2.keymetrics.io/).

1. Run `npm install -g pm2` to install pm2 globally
2. Launch application with `pm2 start .pm2.config.js`
3. Check the application has been deployed using `pm2 list` or `pm2 monit`

#### To Install as a Windows Service:

If using a Microsoft Windows OS utilise [pm2-installer](https://github.com/jessety/pm2-installer) to install PM2 as a Windows service.

**Note:** PM2 will automatically restart the application if `.env` is modified.

### Contextual Link in PAS (TrakCare)

<img src="https://raw.githubusercontent.com/Fdawgs/ydh-sider-obfuscation-service/master/docs/images/ydh_trakcare_sider_contextual_link.png" width="474">

This section is for members of the Solutions Development and Application Support teams at Yeovil District Hospital NHSFT, or other NHS Trusts that use InterSystems TrakCare as their PAS.

The SIDeR contextual link's icon profile values in TrakCare should be set to the following:

Link URL: `<obfuscation service path>/redirect`

Link expression: `"&"_##class(Custom.ENYH.Integration.ContextualLink.GenericPatientLink).BuildURLVars("patient=https://fhir.nhs.uk/Id/nhs-number|{NHSNumber}&birthdate={DateOfBirthISO8601}&location=https://fhir.nhs.uk/Id/ods-organization-code|RA4&practitioner=https://sider.nhs.uk/auth|{UserName}@ydh.nhs.uk")`

<img src="https://raw.githubusercontent.com/Fdawgs/ydh-sider-obfuscation-service/master/docs/images/SIDeR_32.png">

The icon itself can be found in the root of [the images folder](./docs/images/).

## Contributing

Contributions are welcome, and any help is greatly appreciated!

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details on how to get started.
Please adhere to this project's [Code of Conduct](./CODE_OF_CONDUCT.md) when contributing.

## Acknowledgements

-   Anthony Smith - Contextual link logo design
-   David Suckling - Contextual link implementation and testing
-   [**Mark Hunt**](https://github.com/nhsbandit) - Keycloak single sign-on access tokens integration and testing
-   [**Will Jehring**](https://github.com/wjehring) - Query string obfuscation, redirect testing, and Keycloak testing

## License

`ydh-sider-obfuscation-service` is licensed under the [MIT](./LICENSE) license.
