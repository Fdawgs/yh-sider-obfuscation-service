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

	const schema = {
		querystring: {
			type: 'object',
			properties: {
				birthdate: { type: 'string', format: 'date' },
				patient: { type: 'string' },
				location: { type: 'string' },
				practitioner: { type: 'string' }
			},
			required: ['patient', 'birthdate', 'location', 'practitioner']
		}
	};

	fastify.get('*', { schema }, async (req, res) => {
		if (!options.redirectUrl) {
			throw new Error('Recieving endpoint missing');
		}

		const espUrl = options.redirectUrl + queryString.stringify(req.query);
		fastify.log.debug(espUrl);
		res.redirect(espUrl);
	});
}

module.exports = routes;
