const { faker } = require("@faker-js/faker");
const Fastify = require("fastify");
const plugin = require(".");
const getConfig = require("../../config");

faker.locale = "en_GB";

const headers = {
	"Content-Type": "application/json",
	"cache-control": "no-cache",
};

const testParams = {
	birthdate: faker.date.past().toISOString().split("T")[0],
	location: "https://fhir.nhs.uk/Id/ods-organization-code|RA4",
	patient: `https://fhir.nhs.uk/Id/nhs-number|${faker.datatype.number(10)}`,
	practitioner: `https://sider.nhs.uk/auth|obsservice.test@ydh.nhs.uk`,
};

describe("Query String Obfuscation plugin", () => {
	let server;

	beforeEach(() => {
		server = Fastify();

		server.get("/", (req, res) => {
			res.send(req.query);
		});
	});

	afterEach(async () => {
		await server.close();
	});

	test("Should obfuscate patient and birthdate parameters", async () => {
		const config = await getConfig();
		config.obfuscation = {
			encryptionKey: {
				name: "k01",
				value: "0123456789",
			},
			obfuscate: ["birthdate", "patient"],
		};

		server.register(plugin, config);

		await server.ready();

		const response = await server.inject({
			method: "GET",
			url: "/",
			headers,
			query: testParams,
		});

		expect(JSON.parse(response.payload)).toEqual({
			location: testParams.location,
			practitioner: testParams.practitioner,
			enc: expect.any(String),
		});
		expect(response.statusCode).toBe(200);
	});

	test("Should return HTTP status code 500 if options are not passed to plugin", async () => {
		server.register(plugin);

		await server.ready();

		const response = await server.inject({
			method: "GET",
			url: "/",
			headers,
			query: testParams,
		});

		expect(JSON.parse(response.payload)).toEqual({
			error: "Internal Server Error",
			message: "options undefined",
			statusCode: 500,
		});
		expect(response.statusCode).toBe(500);
	});
});
