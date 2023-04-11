const Fastify = require("fastify");
const plugin = require(".");

const testParams = {
	birthdate: "2018-08-01",
	location: "https://fhir.nhs.uk/Id/ods-organization-code|RH5",
	patient: `https://fhir.nhs.uk/Id/nhs-number|9999999999`,
	practitioner: `https://sider.nhs.uk/auth|testFirstName.testLastName@somersetft.nhs.uk`,
};

describe("Query string obfuscation plugin", () => {
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

	it("Obfuscates patient and birthdate parameters", async () => {
		server.register(plugin, {
			encryptionKey: {
				name: "k01",
				value: "0123456789",
			},
			obfuscate: ["birthdate", "patient"],
		});

		await server.ready();

		const response = await server.inject({
			method: "GET",
			url: "/",
			query: testParams,
		});

		expect(JSON.parse(response.payload)).toEqual({
			location: testParams.location,
			practitioner: testParams.practitioner,
			enc: expect.any(String),
		});
		expect(response.statusCode).toBe(200);
	});
});
