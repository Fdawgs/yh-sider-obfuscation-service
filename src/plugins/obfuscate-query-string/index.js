const fp = require("fastify-plugin");
const qs = require("fast-querystring");
const { obfuscate } = require("obfuscated-querystring/lib");

/**
 * @author Frazer Smith
 * @description Pre-handler plugin that obfuscates request query string params.
 * @param {object} server - Fastify instance.
 * @param {object} options - Plugin config values.
 * @param {object} options.encryptionKey - Object containing encryption key values.
 * @param {string} options.encryptionKey.name - Encryption key name.
 * @param {string} options.encryptionKey.value - Encryption key value.
 * @param {Array} options.obfuscate - Query string params that should be obfuscated.
 */
async function plugin(server, options) {
	server.addHook("preHandler", async (req) => {
		const obfuscatedParams = qs.parse(
			obfuscate(qs.stringify(req.query), options)
		);
		req.query = obfuscatedParams;
	});
}

module.exports = fp(plugin, {
	fastify: "4.x",
	name: "obfuscate-query-string",
});
