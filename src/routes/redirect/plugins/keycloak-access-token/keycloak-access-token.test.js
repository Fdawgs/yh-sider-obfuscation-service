/* eslint-disable no-console */
const cloneDeep = require("lodash/cloneDeep");
const faker = require("faker/locale/en_GB");
const Fastify = require("fastify");
const plugin = require(".");

const {
	keycloakRetrieveConfig,
} = require("../../../../../test_resources/mocks/keycloak-config.mock");
const mockKeycloakServer = require("../../../../../test_resources/mocks/keycloak-server.mock");
const getConfig = require("../../../../config");

const headers = {
	"Content-Type": "application/json",
	"cache-control": "no-cache",
};

const mockParams = {
	birthdate: faker.date.past().toISOString().split("T")[0],
	location: "https://fhir.nhs.uk/Id/ods-organization-code|RA4",
	patient: `https://fhir.nhs.uk/Id/nhs-number|${faker.random.number(10)}`,
	practitioner: `https://sider.nhs.uk/auth|obsservice.test@ydh.nhs.uk`,
};

describe("Keycloak access token retrieval plugin", () => {
	let server;
	let config;

	beforeAll(async () => {
		config = await getConfig();
		try {
			await mockKeycloakServer.listen(3000);
			console.log("Mock Keycloak server listening on 3000");
		} catch (err) {
			console.log("Error starting Keycloak server:", err);
			process.exit(1);
		}
	});

	beforeEach(() => {
		server = Fastify();

		server.get("/", (req, res) => {
			res.send(req.query);
		});
	});

	afterAll(async () => {
		await mockKeycloakServer.close();
	});

	afterEach(() => {
		server.close();
	});

	test("Should continue when Keycloak options are not defined", async () => {
		server.register(plugin);

		const res = await server.inject({
			method: "GET",
			url: "/",
			headers,
			query: mockParams,
		});

		expect(res.statusCode).toBe(200);
	});

	test("Should return Keycloak access_token from mock server", async () => {
		server.register(plugin, keycloakRetrieveConfig);

		const res = await server.inject({
			method: "GET",
			url: "/",
			headers,
			query: mockParams,
		});

		const body = JSON.parse(res.body);

		expect(res.statusCode).toBe(200);
		expect(body.access_token).not.toBeUndefined();
		expect(typeof body.access_token).toBe("string");
		expect(body.birthdate).not.toBeUndefined();
		expect(body.location).not.toBeUndefined();
		expect(body.patient).not.toBeUndefined();
		expect(body.practitioner).not.toBeUndefined();
	});

	test("Should return HTTP 500 error when Keycloak endpoint config enabled but other options undefined", async () => {
		const altConfig = cloneDeep(config);
		delete altConfig.keycloak;
		altConfig.keycloak = {
			enabled: true,
		};

		server.register(plugin, altConfig);

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
