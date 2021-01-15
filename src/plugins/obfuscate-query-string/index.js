const createError = require("http-errors");
const fp = require("fastify-plugin");
const { obfuscate } = require("obfuscated-querystring/lib");
const queryString = require("querystring");

/**
 * @author Frazer Smith
 * @description Pre-handler plugin that obfuscates request query string keys and values.
 * @param {Function} server - Fastify instance.
 * @param {object} options - Fastify config values.
 * @param {object} options.obfuscation - Obfuscation values.
 * @param {object} options.obfuscation.encryptionKey - Object containing encryption key values.
 * @param {string} options.obfuscation.encryptionKey.name - Encryption key name.
 * @param {string} options.obfuscation.encryptionKey.value - Encryption key value.
 * @param {Array} options.obfuscation.obfuscate - Query values that should be obfuscated.
 */
async function plugin(server, options) {
	server.addHook("preHandler", (req, res, next) => {
		try {
			req.query = queryString.parse(
				obfuscate(queryString.stringify(req.query), options.obfuscation)
			);
		} catch (err) {
			server.log.error(err);
			res.send(createError(500, err));
		}

		next();
	});
}

module.exports = fp(plugin);
