"use strict";

const fp = require("fastify-plugin");
const {
	parse: fastParse,
	stringify: fastStringify,
} = require("fast-querystring");
const { obfuscate } = require("@blackpear/obfuscated-querystring/lib");

/**
 * @author Frazer Smith
 * @description Pre-handler plugin that obfuscates request query string params.
 * @param {import("fastify").FastifyInstance} server - Fastify instance.
 * @param {object} options - Plugin config values.
 * @param {object} options.encryptionKey - Object containing encryption key values.
 * @param {string} options.encryptionKey.name - Encryption key name.
 * @param {string} options.encryptionKey.value - Encryption key value.
 * @param {string[]} options.obfuscate - Query string params that should be obfuscated.
 */
async function plugin(server, options) {
	server.addHook("preHandler", async (req) => {
		req.query = fastParse(obfuscate(fastStringify(req.query), options));
	});
}

module.exports = fp(plugin, {
	fastify: "4.x",
	name: "obfuscate-query-string",
});
