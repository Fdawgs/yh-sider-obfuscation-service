const createError = require('http-errors');
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
				patient: {
					type: 'string',
					pattern:
						'^https:\\/\\/fhir\\.nhs\\.uk\\/Id\\/nhs-number\\|\\d{10}$'
				},
				location: {
					type: 'string',
					pattern:
						'^https:\\/\\/fhir\\.nhs\\.uk\\/Id\\/ods-organization-code\\|\\w*$'
				},
				practitioner: {
					type: 'string',
					// RFC 5322 compliant email regex
					pattern:
						'^https:\\/\\/sider\\.nhs\\.uk\\/auth\\|(([^<>()\\[\\]\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\.,;:\\s@"]+)*)|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$'
				}
			},
			required: ['patient', 'birthdate', 'location', 'practitioner']
		}
	};

	fastify.get('*', { schema }, async (req, res) => {
		if (!options.redirectUrl) {
			res.send(createError(500, 'Recieving endpoint missing'));
		}

		const espUrl = options.redirectUrl + queryString.stringify(req.query);
		fastify.log.debug(espUrl);
		res.redirect(espUrl);
	});
}

module.exports = routes;
