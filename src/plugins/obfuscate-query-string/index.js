const fp = require("fastify-plugin");
const qs = require("fast-querystring");
const { obfuscate } = require("obfuscated-querystring/lib");

/**
 * @author Frazer Smith
 * @description Pre-handler plugin that obfuscates request query string keys and values.
 * @param {object} server - Fastify instance.
 * @param {object} options - Plugin config values.
 * @param {object} options.obfuscation - Obfuscation values.
 * @param {object} options.obfuscation.encryptionKey - Object containing encryption key values.
 * @param {string} options.obfuscation.encryptionKey.name - Encryption key name.
 * @param {string} options.obfuscation.encryptionKey.value - Encryption key value.
 * @param {Array} options.obfuscation.obfuscate - Query values that should be obfuscated.
 */
async function plugin(server, options) {
	server.addHook("preHandler", async (req) => {
		const obfuscatedParams = qs.parse(
			obfuscate(qs.stringify(req.query), options.obfuscation)
		);
		req.query = obfuscatedParams;
	});
}

module.exports = fp(plugin, {
	fastify: "4.x",
	name: "obfuscate-query-string",
});
