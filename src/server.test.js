/* eslint-disable no-console */
const cloneDeep = require("lodash").cloneDeep;
const faker = require("faker/locale/en_GB");
const Fastify = require("fastify");
const queryString = require("querystring");
const mockServer = require("../test_resources/mocks/sider-server.mock");
const startServer = require("./server");
const getConfig = require("./config");

const headers = {
	"Content-Type": "application/json",
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
	let config;

	beforeAll(async () => {
		config = await getConfig();
		// Scrub any dev/test keycloak config values leftover from `.env`
		delete config.keycloak;
		config.keycloak = {
			enabled: false,
		};

		try {
			await mockServer.listen(3001);
			config.redirectUrl = "http://127.0.0.1:3001/esp/#!/launch?";
			console.log("Mock SIDeR server listening on http://127.0.0.1:3001");
		} catch (err) {
			console.log("Error starting SIDeR server:", err);
			process.exit(1);
		}
	});

	afterAll(async () => {
		await mockServer.close();
	});

	describe("Server", () => {
		let server;

		beforeEach(async () => {
			server = Fastify();
			server.register(startServer, config);
			await server.ready();
		});

		afterEach(async () => {
			await server.close();
		});

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
				location: "https://fhir.nhs.uk/Id/ods-organization-code|RA4",
				practitioner:
					"https://sider.nhs.uk/auth|obsservice.test@ydh.nhs.uk",
				enc: expect.any(String),
			});

			expect(response.statusCode).toBe(302);
		});

		test("Should return HTTP 400 error when any required query string parameter is missing", async () => {
			const altMockParams = cloneDeep(mockParams);
			delete altMockParams.FromIconProfile;
			delete altMockParams.NOUNLOCK;
			delete altMockParams.TPAGID;

			const results = await Promise.all(
				Object.keys(altMockParams).map(async (key) => {
					const scrubbedParams = { ...altMockParams };
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

		test("Should return HTTP 400 error when any required query string parameter does not match expected pattern", async () => {
			const altMockParams = cloneDeep(mockParams);
			delete altMockParams.FromIconProfile;
			delete altMockParams.NOUNLOCK;
			delete altMockParams.TPAGID;

			const results = await Promise.all(
				Object.keys(altMockParams).map(async (key) => {
					const scrubbedParams = { ...altMockParams };
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
	});

	describe("Production Server", () => {
		test("Should redirect to 'redirectUrl' with required params present as production server", async () => {
			const altConfig = cloneDeep(config);
			altConfig.isProduction = true;

			const server = Fastify();
			server.register(startServer, altConfig);
			await server.ready();

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
				location: "https://fhir.nhs.uk/Id/ods-organization-code|RA4",
				practitioner:
					"https://sider.nhs.uk/auth|obsservice.test@ydh.nhs.uk",
				enc: expect.any(String),
			});

			expect(response.statusCode).toBe(302);

			await server.close();
		});
	});

	describe("Keycloak Token Retrival", () => {
		test("Should continue when Keycloak endpoint config is disabled", async () => {
			const altConfig = cloneDeep(config);
			delete altConfig.keycloak;
			altConfig.keycloak = {
				enabled: false,
			};

			const server = Fastify();
			server.register(startServer, altConfig);
			await server.ready();

			const response = await server.inject({
				method: "GET",
				url: "/redirect",
				headers,
				query: mockParams,
			});

			expect(response.headers.location).toMatch(
				"http://127.0.0.1:3001/esp/#!/launch?"
			);
			expect(response.statusCode).toBe(302);

			await server.close();
		});

		test("Should return HTTP 500 error when Keycloak endpoint config enabled but other options undefined", async () => {
			const altConfig = cloneDeep(config);
			delete altConfig.keycloak;
			altConfig.keycloak = {
				enabled: true,
			};

			const server = Fastify();
			server.register(startServer, altConfig);
			await server.ready();

			const response = await server.inject({
				method: "GET",
				url: "/redirect",
				headers,
				query: mockParams,
			});

			const body = JSON.parse(response.body);

			expect(response.statusCode).toBe(500);
			expect(response.statusMessage).toBe("Internal Server Error");
			expect(body.statusCode).toBe(500);
			expect(body.error).toBe("Internal Server Error");

			await server.close();
		});

		test("Should return HTTP 500 error when redirect URL missing", async () => {
			const altConfig = cloneDeep(config);
			delete altConfig.redirectUrl;

			const server = Fastify();
			server.register(startServer, altConfig);
			await server.ready();

			const response = await server.inject({
				method: "GET",
				url: "/redirect",
				headers,
				query: mockParams,
			});

			const body = JSON.parse(response.body);

			expect(response.statusCode).toBe(500);
			expect(response.statusMessage).toBe("Internal Server Error");
			expect(body.statusCode).toBe(500);
			expect(body.error).toBe("Internal Server Error");

			await server.close();
		});
	});
});
