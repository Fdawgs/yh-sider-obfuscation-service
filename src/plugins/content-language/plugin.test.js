const Fastify = require("fastify");
const accepts = require("fastify-accepts");
const plugin = require(".");

describe("Content-Language Plugin", () => {
	describe("Response Headers", () => {
		let server;

		beforeAll(async () => {
			server = Fastify();
			server.register(accepts);
			server.register(plugin, { contentLanguages: ["en"] });

			server.get("/", (req, res) => {
				res.send("ok");
			});

			await server.ready();
		});

		afterAll(async () => {
			await server.close();
		});

		test("Should return `ok`", async () => {
			const response = await server.inject({
				method: "GET",
				url: "/",
				headers: {
					"accept-language": "en, en;q=0.8",
				},
			});

			expect(response.statusCode).toEqual(200);
			expect(response.headers).toEqual(
				expect.objectContaining({
					"content-language": "en",
				})
			);
			expect(response.payload).toEqual("ok");
		});

		test("Should return HTTP status code 406 if media type in `Accept-Language` request header is unsupported", async () => {
			const response = await server.inject({
				method: "GET",
				url: "/",
				headers: {
					"accept-language": "fr",
				},
			});

			expect(response.statusCode).toEqual(406);
		});
	});
});
