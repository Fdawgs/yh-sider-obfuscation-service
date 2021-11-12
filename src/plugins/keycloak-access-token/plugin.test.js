/* eslint-disable no-console */
/* eslint-disable security-node/detect-crlf */
const cloneDeep = require("lodash").cloneDeep;
const faker = require("faker/locale/en_GB");
const Fastify = require("fastify");
const sensible = require("fastify-sensible");
const plugin = require(".");

const {
	keycloakRetrieveConfig,
} = require("../../../test_resources/mocks/keycloak-config.mock");
const mockKeycloakServer = require("../../../test_resources/mocks/keycloak-server.mock");
const getConfig = require("../../config");

const headers = {
	"Content-Type": "application/json",
	"cache-control": "no-cache",
};

const mockParams = {
	birthdate: faker.date.past().toISOString().split("T")[0],
	location: "https://fhir.nhs.uk/Id/ods-organization-code|RA4",
	patient: `https://fhir.nhs.uk/Id/nhs-number|${faker.datatype.number(10)}`,
	practitioner: `https://sider.nhs.uk/auth|obsservice.test@ydh.nhs.uk`,
};

describe("Keycloak Access Token Retrieval Plugin", () => {
	let server;
	let config;

	beforeAll(async () => {
		config = await getConfig();
		try {
			await mockKeycloakServer.listen(3000);
			console.log("Mock Keycloak server listening on 3000");
		} catch (err) {
			console.log("Error starting mock Keycloak server:", err);
			process.exit(1);
		}
	});

	beforeEach(() => {
		server = Fastify();
		server.register(sensible);

		server.get("/", (req, res) => {
			res.send(req.query);
		});
	});

	afterAll(async () => {
		await mockKeycloakServer.close();
	});

	afterEach(async () => {
		await server.close();
	});

	test("Should continue if Keycloak options are not defined", async () => {
		server.register(plugin);

		const response = await server.inject({
			method: "GET",
			url: "/",
			headers,
			query: mockParams,
		});

		expect(JSON.parse(response.payload)).toEqual(mockParams);
		expect(response.statusCode).toBe(200);
	});

	test("Should return Keycloak access_token from mock server", async () => {
		server.register(plugin, keycloakRetrieveConfig);

		const response = await server.inject({
			method: "GET",
			url: "/",
			headers,
			query: mockParams,
		});

		expect(JSON.parse(response.payload)).toEqual({
			...mockParams,
			access_token: "mock-access-token-authorised",
		});
		expect(response.statusCode).toBe(200);
	});

	test("Should return HTTP status code 500 if Keycloak endpoint config enabled but other options undefined", async () => {
		const altConfig = cloneDeep(config);
		delete altConfig.keycloak;
		altConfig.keycloak = {
			enabled: true,
		};

		server.register(plugin, altConfig);

		const response = await server.inject({
			method: "GET",
			url: "/",
			headers,
			query: mockParams,
		});

		expect(JSON.parse(response.payload)).toEqual({
			error: "Internal Server Error",
			message: expect.any(String),
			statusCode: 500,
		});
		expect(response.statusCode).toBe(500);

		await server.close();
	});
});
