/* eslint-disable no-console */
const cloneDeep = require("lodash").cloneDeep;
const { faker } = require("@faker-js/faker");
const Fastify = require("fastify");
const nock = require("nock");
const startServer = require("./server");
const getConfig = require("./config");

faker.locale = "en_GB";

const expResHeaders = {
	"cache-control": "no-store, max-age=0, must-revalidate",
	connection: "keep-alive",
	"content-length": expect.stringMatching(/\d+/),
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
	"content-security-policy":
		"default-src 'self';base-uri 'self';img-src 'self' data:;object-src 'none';child-src 'self';frame-ancestors 'none';form-action 'self';upgrade-insecure-requests;block-all-mixed-content",
	location: expect.stringContaining(
		"https://pyrusapps.blackpear.com/esp/#!/launch?"
	),
	vary: "Origin",
	"x-xss-protection": "0",
};
delete expResHeadersRedirect["content-type"];

const expResHeadersJson = {
	...expResHeaders,
	"content-type": expect.stringContaining("application/json"),
};

const expResHeaders4xxErrors = {
	...expResHeadersJson,
};
delete expResHeaders4xxErrors.vary;
delete expResHeaders4xxErrors["keep-alive"];

const testParams = {
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
		nock.disableNetConnect();

		nock("https://pyrusapps.blackpear.com")
			.replyContentLength()
			.replyDate()
			.get("/esp/#!/launch")
			.reply(200, "Hi", {
				"accept-ranges": "bytes",
				"cache-control": "no-cache",
				"content-type": "text/html",
				server: "Microsoft-IIS/10.0",
				"x-powered-by": "ASP.NET",
			});
	});

	afterAll(async () => {
		nock.cleanAll();
		nock.enableNetConnect();
	});

	describe("End-To-End", () => {
		let server;
		let config;
		let currentEnv;

		beforeAll(async () => {
			Object.assign(process.env, {
				SERVICE_REDIRECT_URL:
					"https://pyrusapps.blackpear.com/esp/#!/launch?",
				KC_ENABLED: false,
			});
			currentEnv = { ...process.env };
		});

		afterEach(async () => {
			// Reset the process.env to default after each test
			jest.resetModules();
			Object.assign(process.env, currentEnv);

			await server.close();
		});

		["development", "production"].forEach((environment) => {
			beforeAll(async () => {
				Object.assign(process.env, {
					NODE_ENV: environment,
				});

				config = await getConfig();
			});

			beforeEach(async () => {
				server = Fastify();
				server.register(startServer, config);
				await server.ready();
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

					expect(resQueryString).toMatchObject({
						location:
							"https://fhir.nhs.uk/Id/ods-organization-code|RA4",
						practitioner:
							"https://sider.nhs.uk/auth|obsservice.test@ydh.nhs.uk",
						enc: expect.any(String),
					});
					expect(response.headers).toEqual(expResHeadersRedirect);
					expect(response.statusCode).toBe(302);
				});

				test("Should return HTTP status code 400 if any required query string parameter is missing", async () => {
					const altTestParams = cloneDeep(testParams);
					delete altTestParams.FromIconProfile;
					delete altTestParams.NOUNLOCK;
					delete altTestParams.TPAGID;

					const results = await Promise.all(
						Object.keys(altTestParams).map(async (key) => {
							const scrubbedParams = { ...altTestParams };
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
					const altTestParams = cloneDeep(testParams);
					delete altTestParams.FromIconProfile;
					delete altTestParams.NOUNLOCK;
					delete altTestParams.TPAGID;

					const results = await Promise.all(
						Object.keys(altTestParams).map(async (key) => {
							const scrubbedParams = { ...altTestParams };
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
	});

	describe("End-To-End - Keycloak Token Retrieval Config Enabled But Keycloak Options Undefined", () => {
		let server;
		let config;

		beforeAll(async () => {
			Object.assign(process.env, {
				SERVICE_REDIRECT_URL:
					"https://pyrusapps.blackpear.com/esp/#!/launch?",
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
					query: testParams,
				});

				expect(JSON.parse(response.payload)).toEqual({
					error: "Internal Server Error",
					message: "Internal Server Error",
					statusCode: 500,
				});
				expect(response.headers).toEqual(expResHeadersJson);
				expect(response.statusCode).toBe(500);

				await server.close();
			});
		});
	});
});
