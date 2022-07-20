const { faker } = require("@faker-js/faker/locale/en_GB");
const Fastify = require("fastify");
const nock = require("nock");
const plugin = require(".");

const getConfig = require("../../config");

/**
 * Refer to option documentation here:
 * https://github.com/keycloak/keycloak-documentation/blob/master/securing_apps/topics/token-exchange/token-exchange.adoc
 */
const testKeycloakConfig = {
	keycloak: {
		enabled: true,
		requestToken: {
			form: {
				audience: "mock-audience",
				client_id: "mock-id",
				client_secret: "mock-secret",
				grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
				requested_token_type:
					"urn:ietf:params:oauth:token-type:access_token",
			},
			url: "https://sso.ydh.nhs.uk/token",
		},
		serviceAuthorisation: {
			form: {
				client_id: "mock-id",
				client_secret: "mock-secret",
				grant_type: "password",
				password: "mock-password",
				username: "mock-user@ydh.nhs.uk",
			},
			url: "https://sso.ydh.nhs.uk/service-auth",
		},
	},
};

const headers = {
	"Content-Type": "application/json",
	"cache-control": "no-cache",
};

const testParams = {
	birthdate: faker.date.past().toISOString().split("T")[0],
	location: "https://fhir.nhs.uk/Id/ods-organization-code|RA4",
	patient: `https://fhir.nhs.uk/Id/nhs-number|${faker.datatype.number(10)}`,
	practitioner: `https://sider.nhs.uk/auth|${faker.name.firstName()}.${faker.name.lastName()}@ydh.nhs.uk`,
};

describe("Keycloak Access Token Retrieval Plugin", () => {
	let server;

	beforeAll(() => {
		nock.disableNetConnect();

		nock("https://sso.ydh.nhs.uk")
			.defaultReplyHeaders({
				"cache-control": "no-store",
				"content-type": "application/json",
				pragma: "no-cache",
				"strict-transport-security":
					"max-age=31536000; includeSubDomains",
				"referrer-policy": "no-referrer",
				"x-content-type": "nosniff",
				"x-frame-options": "SAMEORIGIN",
				"x-xss-protection": "1;mode=block",
			})
			.replyContentLength()
			.replyDate()
			.persist()
			.post("/service-auth")
			.reply(200, {
				access_token: "mock-access-token-authorised",
				expires_in: 900,
				refresh_expires_in: 1000,
				refresh_token: "mock-refresh-token",
				token_type: "bearer",
				"not-before-policy": 0,
				session_state: "mock-session-state",
				scope: "profile email",
			})
			.post("/token", /subject_token=mock-access-token-authorised/)
			.reply(200, {
				access_token: "mock-access-token",
				expires_in: 900,
				refresh_expires_in: 0,
				token_type: "bearer",
				"not-before-policy": 0,
				session_state: "mock-session-state",
				scope: "profile email",
			});
	});

	beforeEach(() => {
		server = Fastify();

		server.get("/", (req, res) => {
			res.send(req.query);
		});
	});

	afterAll(() => {
		nock.cleanAll();
		nock.enableNetConnect();
	});

	afterEach(async () => {
		await server.close();
	});

	test("Should continue if Keycloak options are not defined", async () => {
		await server.register(plugin).ready();

		const response = await server.inject({
			method: "GET",
			url: "/",
			headers,
			query: testParams,
		});

		expect(JSON.parse(response.payload)).toEqual(testParams);
		expect(response.statusCode).toBe(200);
	});

	test("Should return Keycloak access_token from mock server", async () => {
		await server.register(plugin, testKeycloakConfig).ready();

		const response = await server.inject({
			method: "GET",
			url: "/",
			headers,
			query: testParams,
		});

		expect(JSON.parse(response.payload)).toEqual({
			...testParams,
			access_token: "mock-access-token",
		});
		expect(response.statusCode).toBe(200);
	});

	test("Should return HTTP status code 500 if Keycloak endpoint config enabled but other options undefined", async () => {
		const config = await getConfig();
		delete config.keycloak;
		config.keycloak = {
			enabled: true,
		};

		await server.register(plugin, config).ready();

		const response = await server.inject({
			method: "GET",
			url: "/",
			headers,
			query: testParams,
		});

		expect(JSON.parse(response.payload)).toEqual({
			error: "Internal Server Error",
			message: expect.stringMatching(/^Cannot read prop/i),
			statusCode: 500,
		});
		expect(response.statusCode).toBe(500);

		await server.close();
	});
});
