"use strict";

const Fastify = require("fastify");
const sensible = require("@fastify/sensible");
const plugin = require(".");

const testParams = {
	auth: "testKey",
};

describe("Query string auth plugin", () => {
	/** @type {Fastify.FastifyInstance} */
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

	it("Returns response, and remove API key param, if query string API key param in `apiKeys` array", async () => {
		server.register(plugin, {
			apiKeys: [{ clientName: "test", value: "testKey" }],
			queryStringKey: "auth",
		});

		await server.ready();

		const response = await server.inject({
			method: "GET",
			url: "/",
			query: testParams,
		});

		expect(JSON.parse(response.body)).toStrictEqual({});
		expect(response.statusCode).toBe(200);
	});

	it("Returns response, and retain API key param, if query string API key param in `apiKeys` array", async () => {
		server.register(plugin, {
			apiKeys: [{ clientName: "test", value: "testKey" }],
			removeParam: false,
			queryStringKey: "auth",
		});

		await server.ready();

		const response = await server.inject({
			method: "GET",
			url: "/",
			query: testParams,
		});

		expect(JSON.parse(response.body)).toStrictEqual({ auth: "testKey" });
		expect(response.statusCode).toBe(200);
	});

	it("Returns response, and remove API key param, if query string API key param in `apiKeys` set", async () => {
		server.register(plugin, {
			apiKeys: new Set([{ clientName: "test", value: "testKey" }]),
			queryStringKey: "auth",
		});

		await server.ready();

		const response = await server.inject({
			method: "GET",
			url: "/",
			query: testParams,
		});

		expect(JSON.parse(response.body)).toStrictEqual({});
		expect(response.statusCode).toBe(200);
	});

	it("Returns HTTP status code 401 if query string API key param not in `apiKeys` array", async () => {
		server.register(plugin, {
			queryStringKey: "auth",
			apiKeys: [{ clientName: "test", value: "testKeyDeny" }],
		});

		await server.ready();

		const response = await server.inject({
			method: "GET",
			url: "/",
			query: testParams,
		});

		expect(JSON.parse(response.body)).toStrictEqual({
			error: "Unauthorized",
			message: "Unauthorized",
			statusCode: 401,
		});
		expect(response.statusCode).toBe(401);
	});
});
