const Fastify = require("fastify");
const sensible = require("@fastify/sensible");
const plugin = require(".");

const testParams = {
	auth: "testKey",
};

describe("Query string auth plugin", () => {
	let server;

	beforeEach(async () => {
		server = Fastify();

		await server.register(sensible);

		server.get("/", (req, res) => {
			res.send(req.query);
		});
	});

	afterEach(async () => {
		await server.close();
	});

	test("Should return response, and remove API key param, if query string API key param in `apiKeys` array", async () => {
		server.register(plugin, {
			apiKeys: ["testKey"],
			queryStringKey: "auth",
		});

		await server.ready();

		const response = await server.inject({
			method: "GET",
			url: "/",
			query: testParams,
		});

		expect(JSON.parse(response.payload)).toEqual({});
		expect(response.statusCode).toBe(200);
	});

	test("Should return response, and retain API key param, if query string API key param in `apiKeys` array", async () => {
		server.register(plugin, {
			apiKeys: ["testKey"],
			removeParam: false,
			queryStringKey: "auth",
		});

		await server.ready();

		const response = await server.inject({
			method: "GET",
			url: "/",
			query: testParams,
		});

		expect(JSON.parse(response.payload)).toEqual({ auth: "testKey" });
		expect(response.statusCode).toBe(200);
	});

	test("Should return response, and remove API key param, if query string API key param in `apiKeys` set", async () => {
		server.register(plugin, {
			apiKeys: new Set(["testKey"]),
			queryStringKey: "auth",
		});

		await server.ready();

		const response = await server.inject({
			method: "GET",
			url: "/",
			query: testParams,
		});

		expect(JSON.parse(response.payload)).toEqual({});
		expect(response.statusCode).toBe(200);
	});

	test("Should return HTTP status code 401 if query string API key param not in `apiKeys` array", async () => {
		server.register(plugin, {
			queryStringKey: "auth",
			apiKeys: ["testKeyDeny"],
		});

		await server.ready();

		const response = await server.inject({
			method: "GET",
			url: "/",
			query: testParams,
		});

		expect(JSON.parse(response.payload)).toEqual({
			error: "Unauthorized",
			message: "Unauthorized",
			statusCode: 401,
		});
		expect(response.statusCode).toBe(401);
	});
});
