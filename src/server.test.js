const { randomUUID } = require("crypto");
const Fastify = require("fastify");
const qs = require("fast-querystring");
const nock = require("nock");
const startServer = require("./server");
const getConfig = require("./config");

const expResHeaders = {
	"cache-control": "no-store, max-age=0, must-revalidate",
	connection: "keep-alive",
	"content-length": expect.stringMatching(/\d+/),
	"content-security-policy": "default-src 'self';frame-ancestors 'none'",
	"content-type": expect.stringContaining("text/plain"),
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
	"x-ratelimit-limit": expect.any(Number),
	"x-ratelimit-remaining": expect.any(Number),
	"x-ratelimit-reset": expect.any(Number),
};

const expResHeadersRedirect = {
	...expResHeaders,
	"content-type": undefined,
	location: expect.stringContaining(
		"https://pyrusapps.blackpear.com/esp/#!/launch?"
	),
	vary: "Origin",
};

const expResHeadersJson = {
	...expResHeaders,
	"content-type": expect.stringContaining("application/json"),
};

const expResHeadersText = {
	...expResHeaders,
	"content-type": expect.stringContaining("text/plain"),
};

const expResHeaders4xxErrors = {
	...expResHeadersJson,
	"keep-alive": undefined,
	vary: undefined,
};

const testParams = {
	birthdate: "2018-08-01",
	location: "https://fhir.nhs.uk/Id/ods-organization-code|RA4",
	patient: `https://fhir.nhs.uk/Id/nhs-number|9999999999`,
	practitioner: `https://sider.nhs.uk/auth|testFirstName.testLastName@ydh.nhs.uk`,
	TPAGID: randomUUID(),
	FromIconProfile: 1,
	NOUNLOCK: 1,
};

const altTestParams = {
	...testParams,
	FromIconProfile: undefined,
	NOUNLOCK: undefined,
	TPAGID: undefined,
};

describe("Server Deployment", () => {
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
		let server;
		let currentEnv;

		beforeAll(() => {
			Object.assign(process.env, {
				CORS_ALLOWED_HEADERS:
					"Accept, Accept-Encoding, Accept-Language, Authorization, Content-Type, Origin, X-Forwarded-For, X-Requested-With",
				CORS_MAX_AGE: 7200,
				REDIRECT_URL: "https://pyrusapps.blackpear.com/esp/#!/launch?",
				IP_SUBNET_ALLOWED_ARRAY: "",
				KC_ENABLED: false,
			});
			currentEnv = { ...process.env };
		});

		afterEach(async () => {
			// Reset the process.env to default after each test
			Object.assign(process.env, currentEnv);

			await server.close();
		});

		const corsTests = [
			{
				testName: "CORS Disabled",
				envVariables: {
					CORS_ORIGIN: "",
				},
				request: {
					headers: {
						origin: null,
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
				testName: "CORS Enabled",
				envVariables: {
					CORS_ORIGIN: true,
				},
				request: {
					headers: {
						origin: "https://notreal.ydh.nhs.uk",
					},
				},
				expected: {
					response: {
						headers: {
							json: {
								...expResHeadersJson,
								"access-control-allow-origin":
									"https://notreal.ydh.nhs.uk",
							},
							text: {
								...expResHeadersText,
								"access-control-allow-origin":
									"https://notreal.ydh.nhs.uk",
							},
						},
					},
				},
			},
			{
				testName: "Cors Enabled and Set to String",
				envVariables: {
					CORS_ORIGIN: "https://notreal.ydh.nhs.uk",
				},
				request: {
					headers: {
						origin: "https://notreal.ydh.nhs.uk",
					},
				},
				expected: {
					response: {
						headers: {
							json: {
								...expResHeadersJson,
								"access-control-allow-origin":
									"https://notreal.ydh.nhs.uk",
							},
							text: {
								...expResHeadersText,
								"access-control-allow-origin":
									"https://notreal.ydh.nhs.uk",
							},
						},
					},
				},
			},
			{
				testName: "Cors Enabled and Set to Array of Strings",
				envVariables: {
					CORS_ORIGIN: [
						"https://notreal.ydh.nhs.uk",
						"https://notreal.sft.nhs.uk",
					],
				},
				request: {
					headers: {
						origin: "https://notreal.ydh.nhs.uk",
					},
				},
				expected: {
					response: {
						headers: {
							json: {
								...expResHeadersJson,
								"access-control-allow-origin":
									"https://notreal.ydh.nhs.uk",
							},
							text: {
								...expResHeadersText,
								"access-control-allow-origin":
									"https://notreal.ydh.nhs.uk",
							},
						},
					},
				},
			},
			{
				testName: "Cors Enabled and Set to Wildcard",
				envVariables: {
					CORS_ORIGIN: "*",
				},
				request: {
					headers: {
						origin: "https://notreal.ydh.nhs.uk",
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
		corsTests.forEach((testObject) => {
			describe(`${testObject.testName}`, () => {
				beforeAll(async () => {
					Object.assign(process.env, testObject.envVariables);
					config = await getConfig();
				});

				beforeEach(async () => {
					server = Fastify();
					await server.register(startServer, config).ready();
				});

				describe("/admin/healthcheck Route", () => {
					test("Should return `ok`", async () => {
						const response = await server.inject({
							method: "GET",
							url: "/admin/healthcheck",
							headers: {
								accept: "text/plain",
								origin: testObject.request.headers.origin,
							},
						});

						expect(response.payload).toBe("ok");
						expect(response.headers).toEqual(
							testObject.expected.response.headers.text
						);
						expect(response.statusCode).toBe(200);
					});

					// Only applicable if CORS enabled
					if (testObject.envVariables.CORS_ORIGIN) {
						test("Should return response to CORS preflight request", async () => {
							const response = await server.inject({
								method: "OPTIONS",
								url: "/admin/healthcheck",
								headers: {
									"access-control-request-method": "GET",
									origin: testObject.request.headers.origin,
								},
							});

							expect(response.payload).toBe("");
							expect(response.headers).toEqual({
								...expResHeaders,
								"access-control-allow-headers":
									process.env.CORS_ALLOWED_HEADERS,
								"access-control-allow-methods": "GET, HEAD",
								"access-control-allow-origin":
									testObject.envVariables.CORS_ORIGIN === "*"
										? "*"
										: testObject.request.headers.origin,
								"access-control-max-age": String(
									process.env.CORS_MAX_AGE
								),
								"content-type": undefined,
								vary: "Origin",
							});
							expect(response.statusCode).toBe(204);
						});
					}

					test("Should return HTTP status code 406 if media type in `Accept` request header is unsupported", async () => {
						const response = await server.inject({
							method: "GET",
							url: "/admin/healthcheck",
							headers: {
								accept: "application/javascript",
								origin: testObject.request.headers.origin,
							},
						});

						expect(JSON.parse(response.payload)).toEqual({
							error: "Not Acceptable",
							message: "Not Acceptable",
							statusCode: 406,
						});
						expect(response.headers).toEqual(
							testObject.expected.response.headers.json
						);
						expect(response.statusCode).toBe(406);
					});
				});

				describe("Undeclared Route", () => {
					test("Should return HTTP status code 404 if route not found", async () => {
						const response = await server.inject({
							method: "GET",
							url: "/invalid",
							headers: {
								accept: "application/json",
								origin: testObject.request.headers.origin,
							},
						});

						expect(JSON.parse(response.payload)).toEqual({
							error: "Not Found",
							message: "Route GET:/invalid not found",
							statusCode: 404,
						});
						expect(response.headers).toEqual(
							expResHeaders4xxErrors
						);
						expect(response.statusCode).toBe(404);
					});
				});
			});
		});
	});

	describe("IP Address And Subnet Mask Limiting Enabled", () => {
		let server;
		let config;

		beforeAll(async () => {
			Object.assign(process.env, {
				REDIRECT_URL: "https://pyrusapps.blackpear.com/esp/#!/launch?",
				IP_SUBNET_ALLOWED_ARRAY:
					'[{"ipAddress": "127.0.0.1", "subnetMask": "255.255.255.255"}]',
				KC_ENABLED: false,
			});
			config = await getConfig();

			server = Fastify();
			await server.register(startServer, config).ready();
		});

		afterAll(async () => {
			await server.close();
		});

		describe("/redirect Route", () => {
			test("Should return HTTP status code 500", async () => {
				const response = await server.inject({
					method: "GET",
					url: "/redirect",
					headers: { accept: "text/html" },
					query: testParams,
				});

				const resQueryString = qs.parse(
					response.headers.location.substring(
						response.headers.location.indexOf("?") + 1,
						response.headers.location.length
					)
				);

				expect(resQueryString).toMatchObject({
					location:
						"https://fhir.nhs.uk/Id/ods-organization-code|RA4",
					practitioner: testParams.practitioner,
					enc: expect.any(String),
				});
				expect(response.headers).toEqual(expResHeadersRedirect);
				expect(response.statusCode).toBe(302);
			});
		});
	});

	describe("Keycloak Token Retrieval Config Disabled", () => {
		let server;
		let config;

		beforeAll(async () => {
			Object.assign(process.env, {
				REDIRECT_URL: "https://pyrusapps.blackpear.com/esp/#!/launch?",
				IP_SUBNET_ALLOWED_ARRAY: "",
				KC_ENABLED: false,
			});
			config = await getConfig();

			server = Fastify();
			await server.register(startServer, config).ready();
		});

		afterAll(async () => {
			await server.close();
		});

		describe("/admin/healthcheck Route", () => {
			test("Should return `ok`", async () => {
				const response = await server.inject({
					method: "GET",
					url: "/admin/healthcheck",
					headers: {
						accept: "text/plain",
					},
				});

				expect(response.payload).toBe("ok");
				expect(response.headers).toEqual(expResHeaders);
				expect(response.statusCode).toBe(200);
			});

			test("Should return HTTP status code 406 if media type in `Accept` request header is unsupported", async () => {
				const response = await server.inject({
					method: "GET",
					url: "/admin/healthcheck",
					headers: {
						accept: "application/javascript",
					},
				});

				expect(JSON.parse(response.payload)).toEqual({
					error: "Not Acceptable",
					message: "Not Acceptable",
					statusCode: 406,
				});
				expect(response.headers).toEqual(expResHeadersJson);
				expect(response.statusCode).toBe(406);
			});
		});

		describe("Undeclared Route", () => {
			test("Should return HTTP status code 404 if route not found", async () => {
				const response = await server.inject({
					method: "GET",
					url: "/invalid",
					headers: {
						accept: "application/json",
					},
				});

				expect(JSON.parse(response.payload)).toEqual({
					error: "Not Found",
					message: "Route GET:/invalid not found",
					statusCode: 404,
				});
				expect(response.headers).toEqual(expResHeaders4xxErrors);
				expect(response.statusCode).toBe(404);
			});
		});

		describe("/redirect Route", () => {
			test("Should redirect to 'redirectUrl' with required params present", async () => {
				const response = await server.inject({
					method: "GET",
					url: "/redirect",
					headers: { accept: "text/html" },
					query: testParams,
				});

				const resQueryString = qs.parse(
					response.headers.location.substring(
						response.headers.location.indexOf("?") + 1,
						response.headers.location.length
					)
				);

				expect(resQueryString).toMatchObject({
					location:
						"https://fhir.nhs.uk/Id/ods-organization-code|RA4",
					practitioner: testParams.practitioner,
					enc: expect.any(String),
				});
				expect(response.headers).toEqual(expResHeadersRedirect);
				expect(response.statusCode).toBe(302);
			});

			test("Should return HTTP status code 400 if any required query string parameter is missing", async () => {
				const results = await Promise.all(
					Object.keys(altTestParams).map((key) => {
						const scrubbedParams = { ...altTestParams };
						// eslint-disable-next-line security/detect-object-injection
						delete scrubbedParams[key];

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

				expect(results).toEqual(
					expect.arrayContaining([400, 400, 400, 400])
				);
			});

			test("Should return HTTP status code 400 if any required query string parameter does not match expected pattern", async () => {
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

				expect(results).toEqual(
					expect.arrayContaining([400, 400, 400, 400])
				);
			});

			test("Should return HTTP status code 406 if content-type in `Accept` request header unsupported", async () => {
				const response = await server.inject({
					method: "GET",
					url: "/redirect",
					headers: {
						accept: "application/javascript",
					},
					query: testParams,
				});

				expect(JSON.parse(response.payload)).toEqual({
					error: "Not Acceptable",
					message: "Not Acceptable",
					statusCode: 406,
				});
				expect(response.headers).toEqual(expResHeadersJson);
				expect(response.statusCode).toBe(406);
			});
		});
	});

	describe("Keycloak Token Retrieval Config Enabled But Keycloak Options Undefined", () => {
		let server;
		let config;

		beforeAll(async () => {
			Object.assign(process.env, {
				REDIRECT_URL: "https://pyrusapps.blackpear.com/esp/#!/launch?",
				IP_SUBNET_ALLOWED_ARRAY: "",
			});

			config = await getConfig();
			config.keycloak = {
				enabled: true,
			};

			server = Fastify();
			await server.register(startServer, config).ready();
		});

		afterAll(async () => {
			await server.close();
		});

		describe("/admin/healthcheck Route", () => {
			test("Should return `ok`", async () => {
				const response = await server.inject({
					method: "GET",
					url: "/admin/healthcheck",
					headers: {
						accept: "text/plain",
					},
				});

				expect(response.payload).toBe("ok");
				expect(response.headers).toEqual(expResHeaders);
				expect(response.statusCode).toBe(200);
			});

			test("Should return HTTP status code 406 if media type in `Accept` request header is unsupported", async () => {
				const response = await server.inject({
					method: "GET",
					url: "/admin/healthcheck",
					headers: {
						accept: "application/javascript",
					},
				});

				expect(JSON.parse(response.payload)).toEqual({
					error: "Not Acceptable",
					message: "Not Acceptable",
					statusCode: 406,
				});
				expect(response.headers).toEqual(expResHeadersJson);
				expect(response.statusCode).toBe(406);
			});
		});

		describe("/redirect Route", () => {
			test("Should return HTTP status code 500", async () => {
				const response = await server.inject({
					method: "GET",
					url: "/redirect",
					headers: { accept: "text/html" },
					query: testParams,
				});

				expect(JSON.parse(response.payload)).toEqual({
					error: "Internal Server Error",
					message: "Internal Server Error",
					statusCode: 500,
				});
				expect(response.headers).toEqual(expResHeadersJson);
				expect(response.statusCode).toBe(500);
			});
		});
	});
});
