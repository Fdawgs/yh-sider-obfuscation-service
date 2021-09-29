/* eslint-disable no-console */
const cloneDeep = require("lodash").cloneDeep;
const faker = require("faker/locale/en_GB");
const Fastify = require("fastify");
const mockServer = require("../test_resources/mocks/sider-server.mock");
const startServer = require("./server");
const getConfig = require("./config");

const expResHeaders = {
	"content-security-policy":
		"default-src 'self';base-uri 'self';img-src 'self' data:;object-src 'none';child-src 'self';frame-ancestors 'none';form-action 'self';upgrade-insecure-requests;block-all-mixed-content",
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
	pragma: "no-cache",
	expires: "0",
	"permissions-policy": "interest-cohort=()",
	vary: "Origin, accept-encoding",
	"x-ratelimit-limit": expect.any(Number),
	"x-ratelimit-remaining": expect.any(Number),
	"x-ratelimit-reset": expect.any(Number),
	"content-type": expect.stringContaining("text/plain"),
	"content-length": expect.any(String),
	date: expect.any(String),
	connection: "keep-alive",
};

const expResHeadersJson = {
	...expResHeaders,
	...{ "content-type": expect.stringContaining("application/json") },
};

const headers = {
	accept: "text/html",
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

		beforeAll(async () => {
			Object.assign(process.env, {
				SERVICE_REDIRECT_URL: "http://127.0.0.1:3001/esp/#!/launch?",
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

				expect(response.payload).toEqual("ok");
				expect(response.headers).toEqual(
					expect.objectContaining(expResHeaders)
				);
				expect(response.statusCode).toEqual(200);
			});

			test("Should return HTTP status code 406 if media type in `Accept` request header is unsupported", async () => {
				const response = await server.inject({
					method: "GET",
					url: "/admin/healthcheck",
					headers: {
						accept: "application/javascript",
					},
				});

				expect(response.headers).toEqual(
					expect.objectContaining(expResHeadersJson)
				);
				expect(response.statusCode).toEqual(406);
			});
		});

		describe("/redirect Route", () => {
			test("Should redirect to 'redirectUrl' with required params present", async () => {
				const response = await server.inject({
					method: "GET",
					url: "/redirect",
					headers,
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

				expect(response.headers.location).toEqual(
					expect.stringContaining(
						"http://127.0.0.1:3001/esp/#!/launch?"
					)
				);

				expect(resQueryString).toEqual(
					expect.objectContaining({
						location:
							"https://fhir.nhs.uk/Id/ods-organization-code|RA4",
						practitioner:
							"https://sider.nhs.uk/auth|obsservice.test@ydh.nhs.uk",
						enc: expect.any(String),
					})
				);

				expect(response.statusCode).toEqual(302);
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
							headers,
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
							headers,
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

				expect(response.headers).toEqual(
					expect.objectContaining(expResHeadersJson)
				);
				expect(response.statusCode).toEqual(406);
			});
		});
	});

	describe("End-To-End - Production Server", () => {
		let server;
		let config;

		beforeAll(async () => {
			Object.assign(process.env, {
				NODE_ENV: "production",
				SERVICE_REDIRECT_URL: "http://127.0.0.1:3001/esp/#!/launch?",
			});

			config = await getConfig();
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

				expect(response.payload).toEqual("ok");
				expect(response.headers).toEqual(
					expect.objectContaining(expResHeaders)
				);
				expect(response.statusCode).toEqual(200);
			});

			test("Should return HTTP status code 406 if media type in `Accept` request header is unsupported", async () => {
				const response = await server.inject({
					method: "GET",
					url: "/admin/healthcheck",
					headers: {
						accept: "application/javascript",
					},
				});

				expect(response.headers).toEqual(
					expect.objectContaining(expResHeadersJson)
				);
				expect(response.statusCode).toEqual(406);
			});
		});

		describe("/redirect Route", () => {
			test("Should redirect to 'redirectUrl' with required params present as production server", async () => {
				const response = await server.inject({
					method: "GET",
					url: "/redirect",
					headers,
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

				expect(response.headers.location).toEqual(
					expect.stringContaining(
						"http://127.0.0.1:3001/esp/#!/launch?"
					)
				);

				expect(resQueryString).toEqual(
					expect.objectContaining({
						location:
							"https://fhir.nhs.uk/Id/ods-organization-code|RA4",
						practitioner:
							"https://sider.nhs.uk/auth|obsservice.test@ydh.nhs.uk",
						enc: expect.any(String),
					})
				);

				expect(response.statusCode).toEqual(302);

				await server.close();
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

				expect(response.payload).toEqual("ok");
				expect(response.headers).toEqual(
					expect.objectContaining(expResHeaders)
				);
				expect(response.statusCode).toEqual(200);
			});

			test("Should return HTTP status code 406 if media type in `Accept` request header is unsupported", async () => {
				const response = await server.inject({
					method: "GET",
					url: "/admin/healthcheck",
					headers: {
						accept: "application/javascript",
					},
				});

				expect(response.headers).toEqual(
					expect.objectContaining(expResHeadersJson)
				);
				expect(response.statusCode).toEqual(406);
			});
		});

		describe("/redirect Route", () => {
			test("Should continue if Keycloak endpoint config is disabled", async () => {
				const response = await server.inject({
					method: "GET",
					url: "/redirect",
					headers,
					query: mockParams,
				});

				expect(response.headers.location).toEqual(
					expect.stringContaining(
						"http://127.0.0.1:3001/esp/#!/launch?"
					)
				);
				expect(response.statusCode).toEqual(302);

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

				expect(response.payload).toEqual("ok");
				expect(response.headers).toEqual(
					expect.objectContaining(expResHeaders)
				);
				expect(response.statusCode).toEqual(200);
			});

			test("Should return HTTP status code 406 if media type in `Accept` request header is unsupported", async () => {
				const response = await server.inject({
					method: "GET",
					url: "/admin/healthcheck",
					headers: {
						accept: "application/javascript",
					},
				});

				expect(response.headers).toEqual(
					expect.objectContaining(expResHeadersJson)
				);
				expect(response.statusCode).toEqual(406);
			});
		});

		describe("/redirect Route", () => {
			test("Should return HTTP status code 500", async () => {
				const response = await server.inject({
					method: "GET",
					url: "/redirect",
					headers,
					query: mockParams,
				});

				expect(response.headers).toEqual(
					expect.objectContaining(expResHeadersJson)
				);
				expect(response.statusCode).toEqual(500);

				await server.close();
			});
		});
	});
});
