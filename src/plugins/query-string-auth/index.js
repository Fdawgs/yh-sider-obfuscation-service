"use strict";

const fp = require("fastify-plugin");

/**
 * @typedef {object} ApiKey
 * @property {string} clientName - Name of client or service associated with API key.
 * @property {string} value - API key value.
 */

/**
 * @author Frazer Smith
 * @description On-Request plugin that checks request query string API key param is in allowed list.
 * @param {import("fastify").FastifyInstance} server - Fastify instance.
 * @param {object} options - Plugin config values.
 * @param {ApiKey[]|Set<ApiKey>} options.apiKeys - Array or Set of objects containing allowed API keys.
 * @param {boolean} [options.removeParam] - Remove API key param from query string after it has been checked.
 * This stops the API key being exposed to the redirect URL.
 * Defaults to `true`.
 * @param {string} options.queryStringKey - Name of query string key holding API key value.
 */
async function plugin(server, options) {
	// Assign default values to options
	const opts = {
		removeParam: true,
		...options,
	};

	server.addHook("onRequest", async (req) => {
		const apiKey = req.query[opts.queryStringKey];

		if (apiKey && opts.removeParam === true) {
			delete req.query[opts.queryStringKey];
		}

		const keys =
			opts.apiKeys instanceof Set
				? Array.from(opts.apiKeys)
				: options.apiKeys;

		const { clientName, value } =
			keys.find((key) => key.value === apiKey) || {};
		if (!value) {
			throw server.httpErrors.unauthorized();
		}

		req.log.info({ client: clientName }, "requesting client");
	});
}

module.exports = fp(plugin, {
	fastify: "4.x",
	name: "query-string-auth",
	dependencies: ["@fastify/sensible"],
});
