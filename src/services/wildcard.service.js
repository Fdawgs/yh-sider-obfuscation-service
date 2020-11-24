const queryString = require('querystring');

// Import route specific plugins
const keycloakPlugin = require('../plugins/keycloak-access-token.plugin');
const obfuscationPlugin = require('../plugins/obfuscate-query-string.plugin');

/**
 * @author Frazer Smith
 * @description Sets routing options for server.
 * @param {Function} fastify - Fastify instance.
 * @param {object} options - Object containing route config objects.
 */
async function routes(fastify, options) {
	fastify.register(keycloakPlugin, options.keycloak);
	fastify.register(obfuscationPlugin, options.obfuscation);
	fastify.get('*', async (req, res) => {
		if (!options.redirectUrl) {
			return new Error('recieving endpoint missing');
		}
		const espUrl = options.redirectUrl + queryString.stringify(req.query);
		fastify.log.debug(espUrl);
		return res.redirect(espUrl);
	});
}

module.exports = routes;
