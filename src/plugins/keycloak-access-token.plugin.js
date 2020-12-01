/* eslint-disable jsdoc/require-param-description */
const fastifyPlugin = require('fastify-plugin');
const request = require('axios');
const queryString = require('querystring');

/**
 * @author Frazer Smith
 * @description Retrieves Keycloak access token for passed user.
 * @param {Function} fastify - Fastify instance.
 * @param {object} options - Keycloak endpoint access options values.
 * @param {boolean} options.enabled - Toggle to enable or disable use of Keycloak.
 * @param {object} options.serviceAuthorisation
 * @param {object} options.serviceAuthorisation.form
 * @param {string} options.serviceAuthorisation.form.client_id
 * @param {string} options.serviceAuthorisation.form.client_secret
 * @param {string} options.serviceAuthorisation.form.grant_type
 * @param {string} options.serviceAuthorisation.form.password
 * @param {string} options.serviceAuthorisation.form.username
 * @param {string} options.serviceAuthorisation.url
 * @param {object} options.requestToken
 * @param {object} options.requestToken.form
 * @param {string} options.requestToken.form.audience
 * @param {string} options.requestToken.form.client_id
 * @param {string} options.requestToken.form.client_secret
 * @param {string} options.requestToken.form.grant_type
 * @param {string} options.requestToken.form.request_subject
 * @param {string} options.requestToken.form.request_token_type
 * @param {string} options.requestToken.url
 * @returns {Function} Fastify plugin.
 */
async function keycloakAccessTokenPlugin(fastify, options = {}) {
	// Don't attempt to retrieve access tokens if Keycloak not enabled
	if (options.enabled === 'true') {
		fastify.addHook('onRequest', async (req) => {
			try {
				const { requestToken, serviceAuthorisation } = options;

				// Service authorisation to retrieve subject access token
				const serviceAuthResponse = await request.post(
					serviceAuthorisation.url,
					queryString.stringify(serviceAuthorisation.form)
				);

				requestToken.form.subject_token =
					serviceAuthResponse.data.access_token;

				// Expects the practitioner query to be in [system]|[code] format
				requestToken.form.requested_subject = req.query.practitioner.split(
					'|'
				)[1];

				// Request access token for user
				const userAccessResponse = await request.post(
					requestToken.url,
					queryString.stringify(requestToken.form)
				);
				req.query.access_token = userAccessResponse.data.access_token;
				return;
			} catch (err) {
				Error(err);
			}
		});
	}
}

module.exports = fastifyPlugin(keycloakAccessTokenPlugin);
