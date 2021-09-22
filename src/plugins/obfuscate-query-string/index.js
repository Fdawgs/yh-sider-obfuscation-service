const fp = require("fastify-plugin");
const { obfuscate } = require("obfuscated-querystring/lib");
const { URLSearchParams } = require("url");

/**
 * @author Frazer Smith
 * @description Pre-handler plugin that obfuscates request query string keys and values.
 * @param {Function} server - Fastify instance.
 * @param {object} options - Plugin config values.
 * @param {object} options.obfuscation - Obfuscation values.
 * @param {object} options.obfuscation.encryptionKey - Object containing encryption key values.
 * @param {string} options.obfuscation.encryptionKey.name - Encryption key name.
 * @param {string} options.obfuscation.encryptionKey.value - Encryption key value.
 * @param {Array} options.obfuscation.obfuscate - Query values that should be obfuscated.
 */
async function plugin(server, options) {
	server.addHook("preHandler", (req, res, next) => {
		try {
			const obfuscatedParams = new URLSearchParams(
				obfuscate(
					new URLSearchParams(req.query).toString(),
					options.obfuscation
				)
			);

			const result = {};
			Array.from(obfuscatedParams.entries()).forEach((element) => {
				result[element[0]] = element[1];
			});

			req.query = result;
		} catch (err) {
			server.log.error(err);
			res.internalServerError(err);
		}

		next();
	});
}

module.exports = fp(plugin, {
	fastify: "3.x",
	name: "obfuscate-query-string",
	dependencies: ["fastify-sensible"],
});
