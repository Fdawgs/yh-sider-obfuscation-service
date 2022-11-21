const Fastify = require("fastify");
const sensible = require("@fastify/sensible");
const plugin = require(".");

describe("IP Address Limiting Plugin", () => {
	let server;

	beforeEach(async () => {
		server = Fastify();

		await server.register(sensible);

		server.get("/", (req, res) => {
			res.send("ok");
		});
	});

	afterEach(async () => {
		await server.close();
	});

	test("Should return `ok` if request IP address in allowed array", async () => {
		server.register(plugin, new Set([{ ipAddress: "127.0.0.1" }]));

		await server.ready();

		const response = await server.inject({
			method: "GET",
			url: "/",
		});

		expect(response.payload).toBe("ok");
		expect(response.statusCode).toBe(200);
	});

	test("Should return `ok` if request IP address and subnet mask in allowed array", async () => {
		server.register(plugin, [
			{ ipAddress: "127.0.0.1", subnetMask: "255.255.255.255" },
		]);

		await server.ready();

		const response = await server.inject({
			method: "GET",
			url: "/",
		});

		expect(response.payload).toBe("ok");
		expect(response.statusCode).toBe(200);
	});

	test("Should return HTTP status code 403 if request IP address not in allowed array", async () => {
		server.register(plugin, [{ ipAddress: "127.0.0.40" }]);

		await server.ready();

		const response = await server.inject({
			method: "GET",
			url: "/",
		});

		expect(JSON.parse(response.payload)).toEqual({
			error: "Forbidden",
			message: "IP address and/or subnet mask not in accepted range",
			statusCode: 403,
		});
		expect(response.statusCode).toBe(403);
	});

	test("Should return HTTP status code 403 if request IP address in allowed array but subnet mask is not", async () => {
		server.register(plugin, [
			{ ipAddress: "127.0.0.1", subnetMask: "255.255.255.40" },
		]);

		await server.ready();

		const response = await server.inject({
			method: "GET",
			url: "/",
		});

		expect(JSON.parse(response.payload)).toEqual({
			error: "Forbidden",
			message: "IP address and/or subnet mask not in accepted range",
			statusCode: 403,
		});
		expect(response.statusCode).toBe(403);
	});

	test("Should return HTTP status code 403 if request IP address not in allowed array but subnet mask is", async () => {
		server.register(plugin, [
			{ ipAddress: "127.0.0.40", subnetMask: "255.255.255.255" },
		]);

		await server.ready();

		const response = await server.inject({
			method: "GET",
			url: "/",
		});

		expect(JSON.parse(response.payload)).toEqual({
			error: "Forbidden",
			message: "IP address and/or subnet mask not in accepted range",
			statusCode: 403,
		});
		expect(response.statusCode).toBe(403);
	});
});
