/* eslint-disable no-console */
/* eslint-disable security-node/detect-crlf */
const cloneDeep = require("lodash").cloneDeep;
const faker = require("faker/locale/en_GB");
const Fastify = require("fastify");
const mockServer = require("../test_resources/mocks/sider-server.mock");
const startServer = require("./server");
const getConfig = require("./config");

const expResHeaders = {
	"cache-control": "no-store, max-age=0, must-revalidate",
	connection: "keep-alive",
	"content-length": expect.any(String),
	"content-security-policy": "default-src 'self';frame-ancestors 'none'",
	"content-type": expect.stringContaining("text/plain"),
	date: expect.any(String),
	"expect-ct": "max-age=0",
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
	...{
		"content-security-policy":
			"default-src 'self';base-uri 'self';img-src 'self' data:;object-src 'none';child-src 'self';frame-ancestors 'none';form-action 'self';upgrade-insecure-requests;block-all-mixed-content",
		location: expect.stringContaining(
			"http://127.0.0.1:3001/esp/#!/launch?"
		),
		vary: "Origin",
		"x-xss-protection": "0",
	},
};
delete expResHeadersRedirect["content-type"];

const expResHeadersJson = {
	...expResHeaders,
	...{ "content-type": expect.stringContaining("application/json") },
};

const mockParams = {
	birthdate: faker.date.past().toISOString().split("T")[0],
	location: "https://fhir.nhs.uk/Id/ods-organization-code|RA4",
	patient: `https://fhir.nhs.uk/Id/nhs-number|${faker.datatype.number({
		min: 1000000000,
		max: 9999999999,
	})}`,
	practitioner: `https://sider.nhs.uk/auth|obsservice.test@ydh.nhs.uk`,
	TPAGID: faker.datatype.uuid(),
	FromIconProfile: faker.datatype.number(),
	NOUNLOCK: faker.datatype.number(),
};

describe("Server Deployment", () => {
	beforeAll(async () => {
		try {
			await mockServer.listen(3001);
			console.log("Mock SIDeR server listening on http://127.0.0.1:3001");
		} catch (err) {
			console.log("Error starting SIDeR server:", err);
			process.exit(1);
		}
	});

	afterAll(async () => {
		await mockServer.close();
	});

	describe("End-To-End", () => {
		let server;
		let config;

		["development", "production"].forEach((environment) => {
			beforeAll(async () => {
				Object.assign(process.env, {
					NODE_ENV: environment,
					SERVICE_REDIRECT_URL:
						"http://127.0.0.1:3001/esp/#!/launch?",
				});

				config = await getConfig();
				delete config.keycloak;
			});

			beforeEach(async () => {
				server = Fastify();
				server.register(startServer, config);
				await server.ready();
			});

			afterEach(async () => {
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
				test("Should redirect to 'redirectUrl' with required params present", async () => {
					const response = await server.inject({
						method: "GET",
						url: "/redirect",
						headers: { accept: "text/html" },
						query: mockParams,
					});

					const resQueryString = {};
					Array.from(
						new URLSearchParams(
							response.headers.location.substring(
								response.headers.location.indexOf("?") + 1,
								response.headers.location.length
							)
						).entries()
					).forEach((element) => {
						resQueryString[element[0]] = element[1];
					});

					expect(resQueryString).toEqual(
						expect.objectContaining({
							location:
								"https://fhir.nhs.uk/Id/ods-organization-code|RA4",
							practitioner:
								"https://sider.nhs.uk/auth|obsservice.test@ydh.nhs.uk",
							enc: expect.any(String),
						})
					);
					expect(response.headers).toEqual(expResHeadersRedirect);
					expect(response.statusCode).toBe(302);
				});

				test("Should return HTTP status code 400 if any required query string parameter is missing", async () => {
					const altMockParams = cloneDeep(mockParams);
					delete altMockParams.FromIconProfile;
					delete altMockParams.NOUNLOCK;
					delete altMockParams.TPAGID;

					const results = await Promise.all(
						Object.keys(altMockParams).map(async (key) => {
							const scrubbedParams = { ...altMockParams };
							// eslint-disable-next-line security/detect-object-injection
							delete scrubbedParams[key];

							const response = await server.inject({
								method: "GET",
								url: "/redirect",
								headers: { accept: "text/html" },
								query: scrubbedParams,
							});

							return response.statusCode;
						})
					);

					expect(results).toEqual(
						expect.arrayContaining([400, 400, 400, 400])
					);
				});

				test("Should return HTTP status code 400 if any required query string parameter does not match expected pattern", async () => {
					const altMockParams = cloneDeep(mockParams);
					delete altMockParams.FromIconProfile;
					delete altMockParams.NOUNLOCK;
					delete altMockParams.TPAGID;

					const results = await Promise.all(
						Object.keys(altMockParams).map(async (key) => {
							const scrubbedParams = { ...altMockParams };
							// eslint-disable-next-line security/detect-object-injection
							scrubbedParams[key] = "test";

							const response = await server.inject({
								method: "GET",
								url: "/redirect",
								headers: { accept: "text/html" },
								query: scrubbedParams,
							});

							return response.statusCode;
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
						query: mockParams,
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
	});

	describe("End-To-End - Keycloak Token Retrieval Config Disabled", () => {
		let server;
		let config;

		beforeAll(async () => {
			Object.assign(process.env, {
				SERVICE_REDIRECT_URL: "http://127.0.0.1:3001/esp/#!/launch?",
			});

			config = await getConfig();
			delete config.keycloak;
			config.keycloak = {
				enabled: false,
			};
		});

		beforeEach(async () => {
			server = Fastify();
			server.register(startServer, config);
			await server.ready();
		});

		afterEach(async () => {
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
			test("Should continue if Keycloak endpoint config is disabled", async () => {
				const response = await server.inject({
					method: "GET",
					url: "/redirect",
					headers: { accept: "text/html" },
					query: mockParams,
				});

				expect(response.headers).toEqual(
					expect.objectContaining(expResHeadersRedirect)
				);
				expect(response.statusCode).toBe(302);

				await server.close();
			});
		});
	});

	describe("End-To-End - Keycloak Token Retrieval Config Enabled But Keycloak Options Undefined", () => {
		let server;
		let config;

		beforeAll(async () => {
			Object.assign(process.env, {
				SERVICE_REDIRECT_URL: "http://127.0.0.1:3001/esp/#!/launch?",
			});

			config = await getConfig();
			delete config.keycloak;
			config.keycloak = {
				enabled: true,
			};
		});

		beforeEach(async () => {
			server = Fastify();
			server.register(startServer, config);
			await server.ready();
		});

		afterEach(async () => {
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
					query: mockParams,
				});

				expect(JSON.parse(response.payload)).toEqual({
					error: "Internal Server Error",
					message: "Unable to retrieve Keycloak access token(s)",
					statusCode: 500,
				});
				expect(response.headers).toEqual(expResHeadersJson);
				expect(response.statusCode).toBe(500);

				await server.close();
			});
		});
	});
});
