const fastifyPlugin = require('fastify-plugin');
const { obfuscate } = require('obfuscated-querystring/lib');
const queryString = require('querystring');

/**
 * @author Frazer Smith
 * @description Obfuscates request query string keys and values.
 * @param {Function} fastify - Fastify instance.
 * @param {object} options - Obfuscation values.
 * @param {object} options.encryptionKey - Object containing encryption key values.
 * @param {string} options.encryptionKey.name - Encryption key name.
 * @param {string} options.encryptionKey.value - Encryption key value.
 * @param {Array} options.obfuscate - Query values that should be obfuscated.
 * @returns {Function} Fastify plugin.
 */
async function obfuscateQueryStringPlugin(fastify, options) {
	fastify.addHook('preHandler', (req, res, next) => {
		try {
			req.query = queryString.parse(
				obfuscate(queryString.stringify(req.query), options)
			);
		} catch (err) {
			return next(new Error(err));
		}

		return next();
	});
}

module.exports = fastifyPlugin(obfuscateQueryStringPlugin);
