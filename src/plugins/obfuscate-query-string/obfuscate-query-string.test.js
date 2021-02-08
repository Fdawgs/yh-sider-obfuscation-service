const cloneDeep = require("lodash").cloneDeep;
const faker = require("faker/locale/en_GB");
const Fastify = require("fastify");
const plugin = require(".");
const getConfig = require("../../config");

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

describe("Query String Obfuscation plugin", () => {
	let config;
	let server;

	beforeAll(async () => {
		config = await getConfig();
	});

	beforeEach(() => {
		server = Fastify();

		server.get("/", (req, res) => {
			res.send(req.query);
		});
	});

	afterEach(() => {
		server.close();
	});

	test("Should obfuscate patient and birthdate parameters", async () => {
		const altConfig = cloneDeep(config);
		altConfig.obfuscation = {
			encryptionKey: {
				name: "k01",
				value: "0123456789",
			},
			obfuscate: ["birthdate", "patient"],
		};

		server.register(plugin, altConfig);

		const { body } = await server.inject({
			method: "GET",
			url: "/",
			headers,
			query: mockParams,
		});

		const response = JSON.parse(body);

		expect(response.birthdate).toBeUndefined();
		expect(response.enc).not.toBeUndefined();
		expect(typeof response.enc).toBe("string");
		expect(response.location).not.toBeUndefined();
		expect(response.patient).toBeUndefined();
		expect(response.practitioner).not.toBeUndefined();
	});

	test("Should return HTTP 500 error when options are not passed to plugin", async () => {
		server.register(plugin);

		const response = await server.inject({
			method: "GET",
			url: "/",
			headers,
			query: mockParams,
		});

		const body = JSON.parse(response.body);

		expect(response.statusCode).toBe(500);
		expect(response.statusMessage).toBe("Internal Server Error");
		expect(body.statusCode).toBe(500);
		expect(body.error).toBe("Internal Server Error");
	});
});
