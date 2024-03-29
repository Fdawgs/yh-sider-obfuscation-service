"use strict";

const { randomUUID } = require("node:crypto");
const Fastify = require("fastify");
const { parse: fastParse } = require("fast-querystring");
const nock = require("nock");
const { firefox } = require("playwright");
const startServer = require("./server");
const getConfig = require("./config");

const expResHeaders = {
	"cache-control": "no-store, max-age=0, must-revalidate",
	connection: "keep-alive",
	"content-length": expect.stringMatching(/\d+/u),
	"content-security-policy": "default-src 'self';frame-ancestors 'none'",
	"content-type": expect.stringMatching(/^text\/plain; charset=utf-8$/iu),
	date: expect.any(String),
	expires: "0",
	"permissions-policy": "interest-cohort=()",
	pragma: "no-cache",
	"referrer-policy": "no-referrer",
	"strict-transport-security": "max-age=31536000; includeSubDomains",
	"surrogate-control": "no-store",
	vary: "Origin, accept-encoding",
	"x-content-type-options": "nosniff",
	"x-dns-prefetch-control": "off",
	"x-download-options": "noopen",
	"x-frame-options": "SAMEORIGIN",
	"x-permitted-cross-domain-policies": "none",
	"x-ratelimit-limit": expect.stringMatching(/\d+/u),
	"x-ratelimit-remaining": expect.stringMatching(/\d+/u),
	"x-ratelimit-reset": expect.stringMatching(/\d+/u),
};

const expResHeadersRedirect = {
	...expResHeaders,
	location: expect.stringContaining(
		"https://pyrusapps.blackpear.com/esp/#!/launch?"
	),
	vary: "Origin",
};
delete expResHeadersRedirect["content-type"];

const expResHeadersHtml = {
	...expResHeaders,
	"content-security-policy":
		"default-src 'self';base-uri 'self';img-src 'self' data:;object-src 'none';child-src 'self';frame-ancestors 'none';form-action 'self';upgrade-insecure-requests;block-all-mixed-content",
	"content-type": expect.stringMatching(/^text\/html; charset=utf-8$/iu),
	"x-xss-protection": "0",
};

const expResHeadersHtmlStatic = {
	...expResHeadersHtml,
	"accept-ranges": "bytes",
	"cache-control": "public, max-age=300",
	"content-length": expect.stringMatching(/\d+/u),
	"content-security-policy":
		"default-src 'self';base-uri 'self';img-src 'self' data:;object-src 'none';child-src 'self';frame-ancestors 'none';form-action 'self';upgrade-insecure-requests;block-all-mixed-content;script-src 'self' 'unsafe-inline';style-src 'self' 'unsafe-inline'",
	etag: expect.any(String),
	"last-modified": expect.any(String),
	vary: "accept-encoding",
};
delete expResHeadersHtmlStatic.expires;
delete expResHeadersHtmlStatic.pragma;
delete expResHeadersHtmlStatic["surrogate-control"];

const expResHeadersPublicImage = {
	...expResHeaders,
	"accept-ranges": "bytes",
	"cache-control": "public, max-age=31536000, immutable",
	"content-length": expect.stringMatching(/\d+/u),
	"content-type": expect.stringMatching(/^image\//iu),
	etag: expect.any(String),
	"last-modified": expect.any(String),
	vary: "accept-encoding",
};
delete expResHeadersPublicImage.expires;
delete expResHeadersPublicImage.pragma;
delete expResHeadersPublicImage["surrogate-control"];

const expResHeadersJson = {
	...expResHeaders,
	"content-type": expect.stringMatching(
		/^application\/json; charset=utf-8$/iu
	),
};

const expResHeadersText = {
	...expResHeaders,
	"content-type": expect.stringMatching(/^text\/plain; charset=utf-8$/iu),
};

const expResHeaders404Errors = {
	...expResHeadersJson,
};
delete expResHeaders404Errors.vary;

const expResHeaders404ErrorsXml = {
	...expResHeaders404Errors,
	"content-security-policy":
		"default-src 'self';base-uri 'self';img-src 'self' data:;object-src 'none';child-src 'self';frame-ancestors 'none';form-action 'self';upgrade-insecure-requests;block-all-mixed-content",
	"content-type": expect.stringMatching(
		/^application\/xml; charset=utf-8$/iu
	),
	"x-xss-protection": "0",
};

const expResHeaders5xxErrors = {
	...expResHeadersJson,
	vary: "accept-encoding",
};

const testParams = {
	birthdate: "2018-08-01",
	location: "https://fhir.nhs.uk/Id/ods-organization-code|RH5",
	patient: `https://fhir.nhs.uk/Id/nhs-number|9999999999`,
	practitioner: `https://sider.nhs.uk/auth|testFirstName.testLastName@somersetft.nhs.uk`,
	TPAGID: randomUUID(),
	FromIconProfile: "1",
	NOUNLOCK: "1",
};

const altTestParams = {
	...testParams,
};
delete altTestParams.FromIconProfile;
delete altTestParams.NOUNLOCK;
delete altTestParams.TPAGID;

describe("Server deployment", () => {
	beforeAll(() => {
		nock.disableNetConnect();

		nock("https://pyrusapps.blackpear.com")
			.replyContentLength()
			.replyDate()
			.persist()
			.get("/esp/#!/launch")
			.reply(200, "Hi", {
				"accept-ranges": "bytes",
				"cache-control": "no-cache",
				"content-type": "text/html",
				server: "Microsoft-IIS/10.0",
				"x-powered-by": "ASP.NET",
			});
	});

	afterAll(() => {
		nock.cleanAll();
		nock.enableNetConnect();
	});

	describe("CORS", () => {
		let config;
		/** @type {{[key: string]: any}} */
		let currentEnv;
		/** @type {Fastify.FastifyInstance} */
		let server;

		beforeAll(() => {
			Object.assign(process.env, {
				CORS_ALLOWED_HEADERS:
					"Accept, Accept-Encoding, Accept-Language, Authorization, Content-Type, Origin, X-Forwarded-For, X-Requested-With",
				CORS_MAX_AGE: 7200,
				REDIRECT_URL: "https://pyrusapps.blackpear.com/esp/#!/launch?",
				KC_ENABLED: false,
				QUERY_STRING_API_KEY_ARRAY: "",
			});
			currentEnv = { ...process.env };
		});

		const corsTests = [
			{
				testName: "CORS disabled",
				envVariables: {
					CORS_ORIGIN: "",
				},
				request: {
					headers: {
						origin: "",
					},
				},
				expected: {
					response: {
						headers: {
							json: expResHeadersJson,
							text: expResHeadersText,
						},
					},
				},
			},
			{
				testName: "CORS enabled",
				envVariables: {
					CORS_ORIGIN: true,
				},
				request: {
					headers: {
						origin: "https://notreal.somersetft.nhs.uk",
					},
				},
				expected: {
					response: {
						headers: {
							json: {
								...expResHeadersJson,
								"access-control-allow-origin":
									"https://notreal.somersetft.nhs.uk",
							},
							text: {
								...expResHeadersText,
								"access-control-allow-origin":
									"https://notreal.somersetft.nhs.uk",
							},
						},
					},
				},
			},
			{
				testName: "CORS enabled and set to string",
				envVariables: {
					CORS_ORIGIN: "https://notreal.somersetft.nhs.uk",
				},
				request: {
					headers: {
						origin: "https://notreal.somersetft.nhs.uk",
					},
				},
				expected: {
					response: {
						headers: {
							json: {
								...expResHeadersJson,
								"access-control-allow-origin":
									"https://notreal.somersetft.nhs.uk",
							},
							text: {
								...expResHeadersText,
								"access-control-allow-origin":
									"https://notreal.somersetft.nhs.uk",
							},
						},
					},
				},
			},
			{
				testName: "Cors enabled and set to array of strings",
				envVariables: {
					CORS_ORIGIN: [
						"https://notreal.somersetft.nhs.uk",
						"https://notreal.sft.nhs.uk",
					],
				},
				request: {
					headers: {
						origin: "https://notreal.somersetft.nhs.uk",
					},
				},
				expected: {
					response: {
						headers: {
							json: {
								...expResHeadersJson,
								"access-control-allow-origin":
									"https://notreal.somersetft.nhs.uk",
							},
							text: {
								...expResHeadersText,
								"access-control-allow-origin":
									"https://notreal.somersetft.nhs.uk",
							},
						},
					},
				},
			},
			{
				testName: "CORS enabled and set to wildcard",
				envVariables: {
					CORS_ORIGIN: "*",
				},
				request: {
					headers: {
						origin: "https://notreal.somersetft.nhs.uk",
					},
				},
				expected: {
					response: {
						headers: {
							json: {
								...expResHeadersJson,
								"access-control-allow-origin": "*",
							},
							text: {
								...expResHeadersText,
								"access-control-allow-origin": "*",
							},
						},
					},
				},
			},
		];

		describe.each(corsTests)(
			"$testName",
			({ envVariables, expected, request }) => {
				beforeAll(async () => {
					Object.assign(process.env, envVariables);
					config = await getConfig();

					server = Fastify({ pluginTimeout: 0 });
					await server.register(startServer, config).ready();
				});

				afterAll(async () => {
					// Reset the process.env to default after all tests in describe block
					Object.assign(process.env, currentEnv);

					await server.close();
				});

				describe("/admin/healthcheck route", () => {
					it("Returns `ok`", async () => {
						const response = await server.inject({
							method: "GET",
							url: "/admin/healthcheck",
							headers: {
								accept: "text/plain",
								origin: request.headers.origin,
							},
						});

						expect(response.body).toBe("ok");
						expect(response.headers).toStrictEqual(
							expected.response.headers.text
						);
						expect(response.statusCode).toBe(200);
					});

					// Only applicable if CORS enabled
					if (envVariables.CORS_ORIGIN) {
						it("Returns response to CORS preflight request", async () => {
							const expResHeadersCors = {
								...expResHeaders,
								"access-control-allow-headers":
									process.env.CORS_ALLOWED_HEADERS,
								"access-control-allow-methods": "GET, HEAD",
								"access-control-allow-origin":
									envVariables.CORS_ORIGIN === "*"
										? "*"
										: request.headers.origin,
								"access-control-max-age": String(
									process.env.CORS_MAX_AGE
								),
								vary: "Origin",
							};
							delete expResHeadersCors["content-type"];

							const response = await server.inject({
								method: "OPTIONS",
								url: "/admin/healthcheck",
								headers: {
									"access-control-request-method": "GET",
									origin: request.headers.origin,
								},
							});

							expect(response.body).toBe("");
							expect(response.headers).toStrictEqual(
								expResHeadersCors
							);
							expect(response.statusCode).toBe(204);
						});
					}

					it("Returns HTTP status code 406 if media type in `Accept` request header is unsupported", async () => {
						const response = await server.inject({
							method: "GET",
							url: "/admin/healthcheck",
							headers: {
								accept: "application/javascript",
								origin: request.headers.origin,
							},
						});

						expect(JSON.parse(response.body)).toStrictEqual({
							error: "Not Acceptable",
							message: "Not Acceptable",
							statusCode: 406,
						});
						expect(response.headers).toStrictEqual(
							expected.response.headers.json
						);
						expect(response.statusCode).toBe(406);
					});
				});

				describe("Undeclared route", () => {
					it("Returns HTTP status code 404 if route not found", async () => {
						const response = await server.inject({
							method: "GET",
							url: "/invalid",
							headers: {
								accept: "application/json",
								origin: request.headers.origin,
							},
						});

						expect(JSON.parse(response.body)).toStrictEqual({
							error: "Not Found",
							message: "Route GET:/invalid not found",
							statusCode: 404,
						});
						expect(response.headers).toStrictEqual(
							expResHeaders404Errors
						);
						expect(response.statusCode).toBe(404);
					});

					it("Returns an XML response if media type in `Accept` request header is `application/xml`", async () => {
						const response = await server.inject({
							method: "GET",
							url: "/invalid",
							headers: {
								accept: "application/xml",
							},
						});

						expect(response.body).toBe(
							'<?xml version="1.0" encoding="UTF-8"?><response><statusCode>404</statusCode><error>Not Found</error><message>Route GET:/invalid not found</message></response>'
						);
						expect(response.headers).toStrictEqual(
							expResHeaders404ErrorsXml
						);
						expect(response.statusCode).toBe(404);
					});
				});
			}
		);
	});

	describe("Keycloak token retrieval config", () => {
		let config;
		/** @type {{ [key: string]: any }} */
		let currentEnv;
		/** @type {Fastify.FastifyInstance} */
		let server;

		beforeAll(() => {
			Object.assign(process.env, {
				QUERY_STRING_API_KEY_ARRAY: "",
				REDIRECT_URL: "https://pyrusapps.blackpear.com/esp/#!/launch?",
			});
			currentEnv = { ...process.env };
		});

		const keycloakTests = [
			{
				testName: "Keycloak disabled",
				envVariables: {
					KC_ENABLED: false,
				},
			},
			{
				testName: "Keycloak enabled but Keycloak options undefined",
				envVariables: {
					KC_ENABLED: true,
					KC_REQUESTTOKEN_URL: "",
					KC_REQUESTTOKEN_AUDIENCE: "",
					KC_REQUESTTOKEN_CLIENT_ID: "",
					KC_REQUESTTOKEN_CLIENT_SECRET: "",
					KC_REQUESTTOKEN_GRANT_TYPE: "",
					KC_REQUESTTOKEN_REQUESTED_TOKEN_TYPE: "",
					KC_SERVICEAUTH_URL: "",
					KC_SERVICEAUTH_CLIENT_ID: "",
					KC_SERVICEAUTH_CLIENT_SECRET: "",
					KC_SERVICEAUTH_GRANT_TYPE: "",
					KC_SERVICEAUTH_PASSWORD: "",
					KC_SERVICEAUTH_USERNAME: "",
				},
			},
		];

		describe.each(keycloakTests)("$testName", ({ envVariables }) => {
			beforeAll(async () => {
				Object.assign(process.env, envVariables);
				config = await getConfig();

				server = Fastify({ pluginTimeout: 0 });
				await server.register(startServer, config).ready();
			});

			afterAll(async () => {
				// Reset the process.env to default after all tests in describe block
				Object.assign(process.env, currentEnv);

				await server.close();
			});

			describe("/admin/healthcheck route", () => {
				it("Returns `ok`", async () => {
					const response = await server.inject({
						method: "GET",
						url: "/admin/healthcheck",
						headers: {
							accept: "text/plain",
						},
					});

					expect(response.body).toBe("ok");
					expect(response.headers).toStrictEqual(expResHeaders);
					expect(response.statusCode).toBe(200);
				});

				it("Returns HTTP status code 406 if media type in `Accept` request header is unsupported", async () => {
					const response = await server.inject({
						method: "GET",
						url: "/admin/healthcheck",
						headers: {
							accept: "application/javascript",
						},
					});

					expect(JSON.parse(response.body)).toStrictEqual({
						error: "Not Acceptable",
						message: "Not Acceptable",
						statusCode: 406,
					});
					expect(response.headers).toStrictEqual(expResHeadersJson);
					expect(response.statusCode).toBe(406);
				});
			});

			describe("Undeclared route", () => {
				it("Returns HTTP status code 404 if route not found", async () => {
					const response = await server.inject({
						method: "GET",
						url: "/invalid",
						headers: {
							accept: "application/json",
						},
					});

					expect(JSON.parse(response.body)).toStrictEqual({
						error: "Not Found",
						message: "Route GET:/invalid not found",
						statusCode: 404,
					});
					expect(response.headers).toStrictEqual(
						expResHeaders404Errors
					);
					expect(response.statusCode).toBe(404);
				});
			});

			describe("/redirect route", () => {
				it("Redirects to 'redirectUrl' with required params present", async () => {
					const response = await server.inject({
						method: "GET",
						url: "/redirect",
						headers: { accept: "text/html" },
						query: testParams,
					});

					const location = response.headers.location.toString();
					const resQueryString = fastParse(
						location.slice(location.indexOf("?") + 1)
					);

					expect(resQueryString).toMatchObject({
						location:
							"https://fhir.nhs.uk/Id/ods-organization-code|RH5",
						practitioner: testParams.practitioner,
						enc: expect.any(String),
					});
					expect(response.headers).toStrictEqual(
						expResHeadersRedirect
					);
					expect(response.statusCode).toBe(302);
				});

				it("Returns HTTP status code 400 if any required query string parameter is missing", async () => {
					const results = await Promise.all(
						Object.keys(altTestParams).map((key) => {
							const scrubbedParams = {
								...altTestParams,
								[key]: undefined,
							};

							return server
								.inject({
									method: "GET",
									url: "/redirect",
									headers: { accept: "text/html" },
									query: scrubbedParams,
								})
								.then((response) => response.statusCode);
						})
					);

					expect(results).toStrictEqual(
						expect.arrayContaining([400, 400, 400, 400])
					);
				});

				it("Returns HTTP status code 400 if any required query string parameter does not match expected pattern", async () => {
					const results = await Promise.all(
						Object.keys(altTestParams).map((key) => {
							const scrubbedParams = {
								...altTestParams,
								[key]: "test",
							};

							return server
								.inject({
									method: "GET",
									url: "/redirect",
									headers: { accept: "text/html" },
									query: scrubbedParams,
								})
								.then((response) => response.statusCode);
						})
					);

					expect(results).toStrictEqual(
						expect.arrayContaining([400, 400, 400, 400])
					);
				});

				it("Returns HTTP status code 406 if content-type in `Accept` request header unsupported", async () => {
					const response = await server.inject({
						method: "GET",
						url: "/redirect",
						headers: {
							accept: "application/javascript",
						},
						query: testParams,
					});

					expect(JSON.parse(response.body)).toStrictEqual({
						error: "Not Acceptable",
						message: "Not Acceptable",
						statusCode: 406,
					});
					expect(response.headers).toStrictEqual(expResHeadersJson);
					expect(response.statusCode).toBe(406);
				});
			});
		});
	});

	describe("API documentation", () => {
		let config;
		/** @type {Fastify.FastifyInstance} */
		let server;

		beforeAll(async () => {
			Object.assign(process.env, {
				HOST: "localhost",
				PORT: "3000",
				HTTPS_PFX_PASSPHRASE: "",
				HTTPS_PFX_FILE_PATH: "",
				HTTPS_SSL_CERT_PATH: "",
				HTTPS_SSL_KEY_PATH: "",
				HTTPS_HTTP2_ENABLED: "",
				QUERY_STRING_API_KEY_ARRAY: "",
				REDIRECT_URL: "https://pyrusapps.blackpear.com/esp/#!/launch?",
			});
			config = await getConfig();

			// Turn off logging for test runs
			config.fastifyInit.logger = undefined;
			// @ts-ignore
			server = Fastify({ ...config.fastifyInit, pluginTimeout: 0 });
			await server.register(startServer, config).listen(config.fastify);
		});

		afterAll(async () => server.close());

		describe("Content", () => {
			describe("/docs route", () => {
				it("Returns HTML", async () => {
					const response = await server.inject({
						method: "GET",
						url: "/docs",
						headers: {
							accept: "text/html",
						},
					});

					expect(response.body).toMatchSnapshot();
					expect(response.headers).toStrictEqual(
						expResHeadersHtmlStatic
					);
					expect(response.statusCode).toBe(200);
				});
			});

			describe("/public route", () => {
				it("Returns image", async () => {
					const response = await server.inject({
						method: "GET",
						url: "/public/images/icons/favicon.ico",
						headers: {
							accept: "*/*",
						},
					});

					expect(response.headers).toStrictEqual(
						expResHeadersPublicImage
					);
					expect(response.statusCode).toBe(200);
				});
			});
		});

		describe("Frontend", () => {
			it("Renders docs page without error components", async () => {
				const browserType = await firefox.launch();
				const page = await browserType.newPage();

				await page.goto("http://localhost:3000/docs");
				await expect(page.title()).resolves.toBe(
					"SIDeR Contextual Link Obfuscation Service | Documentation"
				);
				/**
				 * Checks redoc has not rendered an error component.
				 * @see {@link https://github.com/Redocly/redoc/blob/main/src/components/ErrorBoundary.tsx | Redoc ErrorBoundary component}
				 */
				const heading = page.locator("h1 >> nth=0");
				await heading.waitFor();

				await expect(heading.textContent()).resolves.not.toMatch(
					/something\s*went\s*wrong/iu
				);

				await page.close();
				await browserType.close();
			});
		});
	});

	/** @todo Fix this impacting the API documentation `describe` block, and move it back to running before it. */
	describe("Query string API key auth enabled", () => {
		let config;
		/** @type {Fastify.FastifyInstance} */
		let server;

		beforeAll(async () => {
			Object.assign(process.env, {
				REDIRECT_URL: "https://pyrusapps.blackpear.com/esp/#!/launch?",
				QUERY_STRING_API_KEY_ARRAY:
					'[{"clientName": "test", "value": "testKey"}]',
				KC_ENABLED: false,
			});
			config = await getConfig();

			server = Fastify({ pluginTimeout: 0 });
			await server.register(startServer, config).ready();
		});

		afterAll(async () => {
			Object.assign(process.env, {
				QUERY_STRING_API_KEY_ARRAY: "",
			});
			await server.close();
		});

		describe("/redirect route", () => {
			it("Returns HTTP status code 401 if api_key query string param missing", async () => {
				const response = await server.inject({
					method: "GET",
					url: "/redirect",
					headers: { accept: "text/html" },
					query: testParams,
				});

				expect(JSON.parse(response.body)).toStrictEqual({
					error: "Unauthorized",
					message: "Unauthorized",
					statusCode: 401,
				});
				expect(response.headers).toStrictEqual({
					...expResHeadersJson,
					vary: "accept-encoding",
				});
				expect(response.statusCode).toBe(401);
			});

			it("Redirects to 'redirectUrl' with api_key query string param", async () => {
				const response = await server.inject({
					method: "GET",
					url: "/redirect",
					headers: { accept: "text/html" },
					query: { ...testParams, api_key: "testKey" },
				});

				const location = response.headers.location.toString();
				const resQueryString = fastParse(
					location.slice(location.indexOf("?") + 1)
				);

				expect(resQueryString).toMatchObject({
					location:
						"https://fhir.nhs.uk/Id/ods-organization-code|RH5",
					practitioner: testParams.practitioner,
					enc: expect.any(String),
				});
				expect(response.headers).toStrictEqual(expResHeadersRedirect);
				expect(response.statusCode).toBe(302);
			});
		});
	});

	describe("Error handling", () => {
		let config;
		/** @type {Fastify.FastifyInstance} */
		let server;

		beforeAll(async () => {
			Object.assign(process.env, {
				REDIRECT_URL: "https://pyrusapps.blackpear.com/esp/#!/launch?",
			});
			config = await getConfig();

			server = Fastify({ pluginTimeout: 0 });
			await server.register(startServer, config);

			server
				.get("/error", async () => {
					throw new Error("test");
				})
				.get("/error/503", async () => {
					const error = new Error("test");
					error.statusCode = 503;
					throw error;
				});

			await server.ready();
		});

		afterAll(async () => server.close());

		describe("/error route", () => {
			it("Returns HTTP status code 500", async () => {
				const response = await server.inject({
					method: "GET",
					url: "/error",
					headers: {
						accept: "*/*",
					},
				});

				expect(JSON.parse(response.body)).toStrictEqual({
					error: "Internal Server Error",
					message: "Internal Server Error",
					statusCode: 500,
				});
				expect(response.headers).toStrictEqual(expResHeaders5xxErrors);
				expect(response.statusCode).toBe(500);
			});

			it("Returns HTTP status code 503 and does not override error message", async () => {
				const response = await server.inject({
					method: "GET",
					url: "/error/503",
					headers: {
						accept: "*/*",
					},
				});

				expect(JSON.parse(response.body)).toStrictEqual({
					error: "Service Unavailable",
					message: "test",
					statusCode: 503,
				});
				expect(response.headers).toStrictEqual(expResHeaders5xxErrors);
				expect(response.statusCode).toBe(503);
			});
		});
	});
});
