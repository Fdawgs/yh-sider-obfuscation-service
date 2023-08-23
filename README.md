> **Note**
> As of 2023-05-03 I am no longer employed by Somerset NHS Foundation Trust.
> However, this repository will continue to be maintained as it acts as
> a 'canary in the coalmine' for changes to Node and other dependencies.

<a href="https://somersetft.nhs.uk/yeovilhospital/">
	<img alttext="Somerset NHSFT logo" src="https://raw.githubusercontent.com/Fdawgs/yh-sider-obfuscation-service/main/docs/images/somerset-nhsft-logo-left-aligned-transparent-background.png" width="480" />
</a>

# Yeovil Hospital - SIDeR Contextual Link Obfuscation Service

[![GitHub Release](https://img.shields.io/github/release/Fdawgs/yh-sider-obfuscation-service.svg)](https://github.com/Fdawgs/yh-sider-obfuscation-service/releases/latest/)
![Build Status](https://github.com/Fdawgs/yh-sider-obfuscation-service/workflows/CI/badge.svg?branch=main)
[![Coverage Status](https://coveralls.io/repos/github/Fdawgs/yh-sider-obfuscation-service/badge.svg?branch=main)](https://coveralls.io/github/Fdawgs/yh-sider-obfuscation-service?branch=main)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat)](https://github.com/prettier/prettier)

> Yeovil Hospital's SIDeR contextual link obfuscation service

## Overview

This is [Yeovil Hospital](https://somersetft.nhs.uk/yeovilhospital/)'s SIDeR contextual link obfuscation service, a Node.js application using the [Fastify](https://fastify.io/) web framework and Black Pear's [obfuscated-querystring](https://github.com/BlackPearSw/obfuscated-querystring).

This service was created out of a need for query string parameters containing personally identifiable data [to be obfuscated](https://github.com/Somerset-SIDeR-Programme/SIDeR-interop-patterns/wiki/query-string-obfuscation) when users click on the [SIDeR](https://nhssomerset.nhs.uk/about-us/digital-projects/sider/) contextual link within Yeovil Hospital's Patient Administration System (PAS), InterSystems TrakCare.

A video demonstrating the contextual link in action can be found [here](./docs/videos/).

Single sign-on for a user using access tokens from a Keycloak server instance, and query string API key auth, can be enabled using environment variables found in `.env.template`.

## Prerequisites

These are only required if running the API outside of Docker:

-   [Node.js](https://nodejs.org/en/) >=18.12.1

## Setup

Perform the following steps before deployment:

1. Download and extract the [latest release asset](https://github.com/Fdawgs/yh-sider-obfuscation-service/releases/latest)
2. Navigate to the extracted directory
3. Make a copy of `.env.template` in the root directory and rename it to `.env`
4. Configure the application using the environment variables in `.env`

> **Note**
> Set the following environment variables in `.env` to meet NHS England's recommendation to retain six months' worth of logs:
>
> -   `LOG_ROTATION_DATE_FORMAT="YYYY-MM-DD"`
> -   `LOG_ROTATION_FREQUENCY="daily"`
> -   `LOG_ROTATION_MAX_LOGS="180d"`

## Deployment

### Standard deployment

1. Run `npm ci --ignore-scripts --omit=dev` to install dependencies
2. Run `npm start`

The service should now be up and running on the port set in the config. Output similar to the following should appear in stdout or in the log file specified using the `LOG_ROTATION_FILENAME` environment variable:

```json
{
	"level": "info",
	"time": "2022-10-24T09:07:09.513Z",
	"pid": 25212,
	"hostname": "MYCOMPUTER",
	"msg": "Server listening at http://127.0.0.1:49217"
}
```

To test it, use [Insomnia](https://insomnia.rest/) and import the example requests from `./test_resources/insomnia_test_requests.json`.

### Deploying using Docker

This requires [Docker](https://docker.com) installed.

1. Run `docker compose up` (or `docker compose up -d` to run in the background)

### Deploying using PM2

If this cannot be deployed into production using Docker, use a process manager such as [PM2](https://pm2.keymetrics.io/).

1. Run `npm ci --ignore-scripts --omit=dev` to install dependencies
2. Run `npm i -g pm2` to install pm2 globally
3. Launch the application with `pm2 start .pm2.config.js`
4. Check that the application has been deployed using `pm2 list` or `pm2 monit`

#### To install as a Windows service:

If using a Microsoft Windows OS utilise [pm2-installer](https://github.com/jessety/pm2-installer) to install PM2 as a Windows service.

> **Note**
> PM2 will automatically restart the application if `.env` is modified.

## Usage

### Accessing API documentation

API documentation can be found at `/docs`:

<img alttext="Screenshot of SIDeR Contextual Link Obfuscation Service documentation page" src="https://raw.githubusercontent.com/Fdawgs/yh-sider-obfuscation-service/main/docs/images/api_documentation_screenshot.png" width="720">

The underlying OpenAPI definitions are found at `/docs/openapi`.

### Contextual link in PAS (TrakCare)

<img src="https://raw.githubusercontent.com/Fdawgs/yh-sider-obfuscation-service/main/docs/images/yh_trakcare_sider_contextual_link.png" width="474">

This section is for members of the Solutions Development and Application Support teams at Yeovil Hospital, or other NHS Trusts that use InterSystems TrakCare as their PAS.

To adhere to Black Pear/NHS Somerset ICB's [contextual launch specification](https://github.com/Somerset-SIDeR-Programme/SIDeR-interop-patterns/wiki/contextual-launch), the SIDeR contextual link's icon profile values in TrakCare must be set to the following:

Link URL: `<obfuscation service path>/redirect`

Link expression: `"&"_##class(Custom.ENYH.Integration.ContextualLink.GenericPatientLink).BuildURLVars("patient=https://fhir.nhs.uk/Id/nhs-number|{NHSNumber}&birthdate={DateOfBirthISO8601}&location=https://fhir.nhs.uk/Id/ods-organization-code|RH5&practitioner=https://sider.nhs.uk/auth|{UserName}@somersetft.nhs.uk")`

If query string auth is enabled using the `QUERY_STRING_API_KEY_ARRAY` environment variable, the link expression will need to include the `api_key` query string param with a valid API key.

#### Contextual link icon

<img src="https://raw.githubusercontent.com/Fdawgs/yh-sider-obfuscation-service/main/docs/images/SIDeR_32.png">

The icon itself can be found in the root of [the images folder](./docs/images/).

## Contributing

Contributions are welcome, and any help is greatly appreciated!

See [the contributing guide](./CONTRIBUTING.md) for details on how to get started.
Please adhere to this project's [Code of Conduct](./CODE_OF_CONDUCT.md) when contributing.

## Acknowledgements

-   Anthony Smith (Chief Clinical Information Officer) - Contextual link logo design
-   David Suckling (Application Support Manager) - Contextual link implementation and testing
-   [**Mark Hunt**](https://github.com/nhsbandit) - Keycloak single sign-on access tokens integration and testing
-   [**Will Jehring**](https://github.com/wjehring) - Query string obfuscation, redirect testing, and Keycloak testing

## License

`yh-sider-obfuscation-service` is licensed under the [MIT](./LICENSE) license.
