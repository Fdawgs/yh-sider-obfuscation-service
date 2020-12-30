/* eslint-disable no-console */
const autocannon = require("autocannon");
const cloneDeep = require("lodash/cloneDeep");
const faker = require("faker/locale/en_GB");
const Fastify = require("fastify");
const queryString = require("querystring");
const startServer = require("./server");

const mockServer = require("../test_resources/mocks/sider-server.mock");
const getConfig = require("./config");

const config = getConfig();

const headers = {
	"Content-Type": "application/json",
	"cache-control": "no-cache",
};

const mockParams = {
	birthdate: faker.date.past().toISOString().split("T")[0],
	location: "https://fhir.nhs.uk/Id/ods-organization-code|RA4",
	patient: `https://fhir.nhs.uk/Id/nhs-number|${faker.random.number({
		min: 1000000000,
		max: 9999999999,
	})}`,
	practitioner: `https://sider.nhs.uk/auth|obsservice.test@ydh.nhs.uk`,
	TPAGID: faker.random.uuid(),
	FromIconProfile: faker.random.number(),
	NOUNLOCK: faker.random.number(),
};

describe("Server deployment", () => {
	beforeAll(async () => {
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

		afterEach(() => {
			server.close();
		});

		test("Should redirect to 'redirectUrl' with required params present", async () => {
			const res = await server.inject({
				method: "GET",
				url: "/",
				headers,
				query: mockParams,
			});

			const resQueryString = queryString.parse(
				res.headers.location.substring(
					res.headers.location.indexOf("?") + 1,
					res.headers.location.length
				)
			);

			expect(res.headers.location).toMatch(
				"http://127.0.0.1:3001/esp/#!/launch?"
			);

			expect(resQueryString).toMatchObject({
				location: "https://fhir.nhs.uk/Id/ods-organization-code|RA4",
				practitioner:
					"https://sider.nhs.uk/auth|obsservice.test@ydh.nhs.uk",
				enc: expect.any(String),
			});

			expect(res.statusCode).toBe(302);
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

					const res = await server.inject({
						method: "GET",
						url: "/",
						headers,
						query: scrubbedParams,
					});

					return res.statusCode;
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

					const res = await server.inject({
						method: "GET",
						url: "/",
						headers,
						query: scrubbedParams,
					});

					return res.statusCode;
				})
			);

			expect(results).toEqual(
				expect.arrayContaining([400, 400, 400, 400])
			);
		});
	});

	describe("Keycloak token retrival", () => {
		test("Should continue when Keycloak endpoint config is disabled", async () => {
			const altConfig = cloneDeep(config);
			altConfig.keycloak.enabled = false;

			const server = Fastify();
			server.register(startServer, altConfig);
			await server.ready();

			const res = await server.inject({
				method: "GET",
				url: "/",
				headers,
				query: mockParams,
			});

			expect(res.headers.location).toMatch(
				"http://127.0.0.1:3001/esp/#!/launch?"
			);
			expect(res.statusCode).toBe(302);

			server.close();
		});

		test("Should return HTTP 500 error when Keycloak endpoint config enabled but other options undefined", async () => {
			const altConfig = cloneDeep(config);
			altConfig.keycloak.enabled = true;

			const server = Fastify();
			server.register(startServer, altConfig);
			await server.ready();

			const res = await server.inject({
				method: "GET",
				url: "/",
				headers,
				query: mockParams,
			});

			const body = JSON.parse(res.body);

			expect(res.statusCode).toBe(500);
			expect(res.statusMessage).toBe("Internal Server Error");
			expect(body.statusCode).toBe(500);
			expect(body.error).toBe("Internal Server Error");

			server.close();
		});

		test("Should return HTTP 500 error when redirect URL missing", async () => {
			const altConfig = cloneDeep(config);
			delete altConfig.redirectUrl;

			const server = Fastify();
			server.register(startServer, altConfig);
			await server.ready();

			const res = await server.inject({
				method: "GET",
				url: "/",
				headers,
				query: mockParams,
			});

			const body = JSON.parse(res.body);

			expect(res.statusCode).toBe(500);
			expect(res.statusMessage).toBe("Internal Server Error");
			expect(body.statusCode).toBe(500);
			expect(body.error).toBe("Internal Server Error");

			server.close();
		});
	});

	describe("Benchmark", () => {
		const altConfig = cloneDeep(config);
		delete altConfig.https;
		let server;

		beforeEach(async () => {
			server = Fastify();
			server.register(startServer, altConfig);
			await server.listen(altConfig.fastify);
		});

		afterEach(() => {
			server.close();
		});

		test("Should have an average latency less than 50ms", async () => {
			const results = await autocannon({
				url: `http://127.0.0.1:${process.env.SERVICE_PORT}?birthdate=${mockParams.birthdate}&location=${mockParams.location}&patient=${mockParams.patient}&practitioner=${mockParams.practitioner}`,
				duration: 9,
			});

			expect(results.latency.average).toBeLessThan(50);
		});
	});
});
