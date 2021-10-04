const cloneDeep = require("lodash").cloneDeep;
const faker = require("faker/locale/en_GB");
const Fastify = require("fastify");
const sensible = require("fastify-sensible");
const plugin = require(".");
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

describe("Query String Obfuscation plugin", () => {
	let config;
	let server;

	beforeAll(async () => {
		config = await getConfig();
	});

	beforeEach(() => {
		server = Fastify();
		server.register(sensible);

		server.get("/", (req, res) => {
			res.send(req.query);
		});
	});

	afterEach(async () => {
		await server.close();
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

		const response = await server.inject({
			method: "GET",
			url: "/",
			headers,
			query: mockParams,
		});

		expect(JSON.parse(response.payload)).toEqual({
			location: mockParams.location,
			practitioner: mockParams.practitioner,
			enc: expect.any(String),
		});
		expect(response.statusCode).toBe(200);
	});

	test("Should return HTTP status code 500 if options are not passed to plugin", async () => {
		server.register(plugin);

		const response = await server.inject({
			method: "GET",
			url: "/",
			headers,
			query: mockParams,
		});

		expect(JSON.parse(response.payload)).toEqual({
			statusCode: 500,
			error: "Internal Server Error",
			message: "Error: options undefined",
		});
		expect(response.statusCode).toBe(500);
	});
});
