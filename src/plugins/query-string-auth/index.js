const fp = require("fastify-plugin");

/**
 * @author Frazer Smith
 * @description On-Request plugin that checks request query string API key param is in allowed list.
 * @param {object} server - Fastify instance.
 * @param {object} options - Plugin config values.
 * @param {Array} options.apiKeys- Array or Set containing allowed API keys.
 * @param {boolean} [options.removeParam=true] - Remove API key param from query string after it has been checked.
 * Defaults to true.
 * @param {string} options.queryStringKey - Name of query string key holding API key value.
 */
async function plugin(server, options) {
	server.addHook("onRequest", async (req) => {
		const apiKey = req?.query[options.queryStringKey];

		if (apiKey && options?.removeParam !== false) {
			delete req.query[options.queryStringKey];
		}

		const keys =
			options.apiKeys instanceof Set
				? Array.from(options.apiKeys)
				: options.apiKeys;

		const allowed = keys.includes(apiKey);

		if (!allowed) {
			throw server.httpErrors.unauthorized();
		}
	});
}

module.exports = fp(plugin, {
	fastify: "4.x",
	name: "query-string-auth",
	dependencies: ["@fastify/sensible"],
});
