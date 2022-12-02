/* eslint-disable jsdoc/require-param-description */
const fp = require("fastify-plugin");
const qs = require("fast-querystring");
const request = require("axios").default;

/**
 * @author Frazer Smith
 * @description Pre-handler plugin that retrieves Keycloak access token for passed user.
 * @param {object} server - Fastify instance.
 * @param {object} options - Plugin config values.
 * @param {boolean=} options.enabled - Toggle to enable or disable use of Keycloak.
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
 * @param {string} options.requestToken.form.requested_token_type
 * @param {string} options.requestToken.url
 * @see https://github.com/keycloak/keycloak-documentation/blob/main/securing_apps/topics/token-exchange/token-exchange.adoc
 */
async function plugin(server, options) {
	// Do not add preHandler hook and attempt to retrieve access tokens if Keycloak not enabled
	if (options?.enabled === true) {
		const { requestToken, serviceAuthorisation } = options;

		// See https://github.com/axios/axios#request-config
		const axiosOptions = {
			headers: { accept: "application/json" },
			responseType: "json",
		};

		server.addHook("preHandler", async (req) => {
			// Service authorisation to retrieve subject access token
			const serviceAuthResponse = await request.post(
				serviceAuthorisation.url,
				qs.stringify(serviceAuthorisation.form),
				axiosOptions
			);

			// Request access token for user
			const userAccessResponse = await request.post(
				requestToken.url,
				qs.stringify({
					// Expects the practitioner query to be in [system]|[code] format
					requested_subject: req.query.practitioner.split("|")[1],
					subject_token: serviceAuthResponse.data.access_token,
					...requestToken.form,
				}),
				axiosOptions
			);
			req.query.access_token = userAccessResponse.data.access_token;
		});
	}
}

module.exports = fp(plugin, {
	fastify: "4.x",
	name: "keycloak-access-token",
});
