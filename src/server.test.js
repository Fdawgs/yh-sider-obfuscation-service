/* eslint-disable no-console */
const cloneDeep = require("lodash").cloneDeep;
const faker = require("faker/locale/en_GB");
const Fastify = require("fastify");
const queryString = require("querystring");
const mockServer = require("../test_resources/mocks/sider-server.mock");
const startServer = require("./server");
const getConfig = require("./config");

const headers = {
	accept: "text/html",
	"cache-control": "no-cache",
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
			config = await getConfig();
			config.redirectUrl = "http://127.0.0.1:3001/esp/#!/launch?";
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

		describe("/healthcheck Route", () => {
			test("Should return `ok`", async () => {
				const response = await server.inject({
					method: "GET",
					url: "/healthcheck",
					headers: {
						accept: "text/plain",
					},
				});

				expect(response.statusCode).toEqual(200);
				expect(response.payload).toEqual("ok");
			});

			test("Should return HTTP status code 406 if media type in `Accept` request header is unsupported", async () => {
				const response = await server.inject({
					method: "GET",
					url: "/healthcheck",
					headers: {
						accept: "application/javascript",
					},
				});

				expect(response.statusCode).toEqual(406);
			});

			test("Should return HTTP status code 406 if media type in `Accept-Language` request header is unsupported", async () => {
				const response = await server.inject({
					method: "GET",
					url: "/healthcheck",
					headers: {
						"accept-language": "fr",
					},
				});

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

				const resQueryString = queryString.parse(
					response.headers.location.substring(
						response.headers.location.indexOf("?") + 1,
						response.headers.location.length
					)
				);

				expect(response.headers.location).toMatch(
					"http://127.0.0.1:3001/esp/#!/launch?"
				);

				expect(resQueryString).toMatchObject({
					location:
						"https://fhir.nhs.uk/Id/ods-organization-code|RA4",
					practitioner:
						"https://sider.nhs.uk/auth|obsservice.test@ydh.nhs.uk",
					enc: expect.any(String),
				});

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

				expect(response.statusCode).toEqual(406);
			});

			test("Should return HTTP status code 406 if media type in `Accept-Language` request header is unsupported", async () => {
				const response = await server.inject({
					method: "GET",
					url: "/redirect",
					headers: {
						"accept-language": "fr",
					},
				});

				expect(response.statusCode).toEqual(406);
			});
		});
	});

	describe("End-To-End - Production Server", () => {
		let server;
		let config;

		beforeAll(async () => {
			config = await getConfig();
			config.redirectUrl = "http://127.0.0.1:3001/esp/#!/launch?";
			config.isProduction = true;
		});

		beforeEach(async () => {
			server = Fastify();
			server.register(startServer, config);
			await server.ready();
		});

		afterEach(async () => {
			await server.close();
		});

		describe("/healthcheck Route", () => {
			test("Should return `ok`", async () => {
				const response = await server.inject({
					method: "GET",
					url: "/healthcheck",
					headers: {
						accept: "text/plain",
					},
				});

				expect(response.statusCode).toEqual(200);
				expect(response.payload).toEqual("ok");
			});

			test("Should return HTTP status code 406 if media type in `Accept` request header is unsupported", async () => {
				const response = await server.inject({
					method: "GET",
					url: "/healthcheck",
					headers: {
						accept: "application/javascript",
					},
				});

				expect(response.statusCode).toEqual(406);
			});

			test("Should return HTTP status code 406 if media type in `Accept-Language` request header is unsupported", async () => {
				const response = await server.inject({
					method: "GET",
					url: "/healthcheck",
					headers: {
						"accept-language": "fr",
					},
				});

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

				const resQueryString = queryString.parse(
					response.headers.location.substring(
						response.headers.location.indexOf("?") + 1,
						response.headers.location.length
					)
				);

				expect(response.headers.location).toMatch(
					"http://127.0.0.1:3001/esp/#!/launch?"
				);

				expect(resQueryString).toMatchObject({
					location:
						"https://fhir.nhs.uk/Id/ods-organization-code|RA4",
					practitioner:
						"https://sider.nhs.uk/auth|obsservice.test@ydh.nhs.uk",
					enc: expect.any(String),
				});

				expect(response.statusCode).toEqual(302);

				await server.close();
			});
		});
	});

	describe("End-To-End - Keycloak Token Retrieval Config Disabled", () => {
		let server;
		let config;

		beforeAll(async () => {
			config = await getConfig();
			config.redirectUrl = "http://127.0.0.1:3001/esp/#!/launch?";
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

		describe("/healthcheck Route", () => {
			test("Should return `ok`", async () => {
				const response = await server.inject({
					method: "GET",
					url: "/healthcheck",
					headers: {
						accept: "text/plain",
					},
				});

				expect(response.statusCode).toEqual(200);
				expect(response.payload).toEqual("ok");
			});

			test("Should return HTTP status code 406 if media type in `Accept` request header is unsupported", async () => {
				const response = await server.inject({
					method: "GET",
					url: "/healthcheck",
					headers: {
						accept: "application/javascript",
					},
				});

				expect(response.statusCode).toEqual(406);
			});

			test("Should return HTTP status code 406 if media type in `Accept-Language` request header is unsupported", async () => {
				const response = await server.inject({
					method: "GET",
					url: "/healthcheck",
					headers: {
						"accept-language": "fr",
					},
				});

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

				expect(response.headers.location).toMatch(
					"http://127.0.0.1:3001/esp/#!/launch?"
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
			config = await getConfig();
			config.redirectUrl = "http://127.0.0.1:3001/esp/#!/launch?";
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

		describe("/healthcheck Route", () => {
			test("Should return `ok`", async () => {
				const response = await server.inject({
					method: "GET",
					url: "/healthcheck",
					headers: {
						accept: "text/plain",
					},
				});

				expect(response.statusCode).toEqual(200);
				expect(response.payload).toEqual("ok");
			});

			test("Should return HTTP status code 406 if media type in `Accept` request header is unsupported", async () => {
				const response = await server.inject({
					method: "GET",
					url: "/healthcheck",
					headers: {
						accept: "application/javascript",
					},
				});

				expect(response.statusCode).toEqual(406);
			});

			test("Should return HTTP status code 406 if media type in `Accept-Language` request header is unsupported", async () => {
				const response = await server.inject({
					method: "GET",
					url: "/healthcheck",
					headers: {
						"accept-language": "fr",
					},
				});

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

				const body = JSON.parse(response.body);

				expect(response.statusCode).toEqual(500);
				expect(response.statusMessage).toEqual("Internal Server Error");
				expect(body.statusCode).toEqual(500);
				expect(body.error).toEqual("Internal Server Error");

				await server.close();
			});
		});
	});

	describe("End-To-End - Redirect URL Missing", () => {
		let server;
		let config;

		beforeAll(async () => {
			config = await getConfig();
			config.redirectUrl = "http://127.0.0.1:3001/esp/#!/launch?";
			delete config.redirectUrl;
		});

		beforeEach(async () => {
			server = Fastify();
			server.register(startServer, config);
			await server.ready();
		});

		afterEach(async () => {
			await server.close();
		});

		describe("/healthcheck Route", () => {
			test("Should return `ok`", async () => {
				const response = await server.inject({
					method: "GET",
					url: "/healthcheck",
					headers: {
						accept: "text/plain",
					},
				});

				expect(response.statusCode).toEqual(200);
				expect(response.payload).toEqual("ok");
			});

			test("Should return HTTP status code 406 if media type in `Accept` request header is unsupported", async () => {
				const response = await server.inject({
					method: "GET",
					url: "/healthcheck",
					headers: {
						accept: "application/javascript",
					},
				});

				expect(response.statusCode).toEqual(406);
			});

			test("Should return HTTP status code 406 if media type in `Accept-Language` request header is unsupported", async () => {
				const response = await server.inject({
					method: "GET",
					url: "/healthcheck",
					headers: {
						"accept-language": "fr",
					},
				});

				expect(response.statusCode).toEqual(406);
			});
		});

		describe("/redirect Route", () => {
			test("Should return HTTP status code 500 if redirect URL missing", async () => {
				const response = await server.inject({
					method: "GET",
					url: "/redirect",
					headers,
					query: mockParams,
				});

				const body = JSON.parse(response.body);

				expect(response.statusCode).toEqual(500);
				expect(response.statusMessage).toEqual("Internal Server Error");
				expect(body.statusCode).toEqual(500);
				expect(body.error).toEqual("Internal Server Error");

				await server.close();
			});
		});
	});
});
