/* eslint-disable jsdoc/require-param-description -- Params are self-explanatory */

"use strict";

const fp = require("fastify-plugin");
const { stringify: fastStringify } = require("fast-querystring");
const { post } = require("axios");

/**
 * @author Frazer Smith
 * @description Pre-handler plugin that retrieves Keycloak access token for passed user.
 * @param {import("fastify").FastifyInstance} server - Fastify instance.
 * @param {object} options - Plugin config values.
 * @param {boolean} [options.enabled] - Toggle to enable or disable use of Keycloak.
 * @param {object} [options.serviceAuthorisation]
 * @param {object} options.serviceAuthorisation.form
 * @param {string} options.serviceAuthorisation.url
 * @param {object} [options.requestToken]
 * @param {object} options.requestToken.form
 * @param {string} options.requestToken.url
 * @see {@link https://github.com/keycloak/keycloak-documentation/blob/main/securing_apps/topics/token-exchange/token-exchange.adoc | Keycloak Token Exchange}
 */
async function plugin(server, options) {
	// Do not add preHandler hook and attempt to retrieve access tokens if Keycloak not enabled
	if (options.enabled === true) {
		const { requestToken, serviceAuthorisation } = options;

		/** @see {@link https://github.com/axios/axios#request-config | Axios Request Config} */
		const axiosOptions = {
			headers: { accept: "application/json" },
			responseType: "json",
		};

		server.addHook("preHandler", async (req) => {
			const { practitioner } = req.query;

			try {
				// Service authorisation to retrieve subject access token
				const { data: serviceAuthData } = await post(
					serviceAuthorisation.url,
					fastStringify(serviceAuthorisation.form),
					axiosOptions
				);

				// Request access token for user
				const { data: userAccessData } = await post(
					requestToken.url,
					fastStringify({
						// Expects the query string practitioner value to be in [system]|[code] format
						requested_subject: practitioner.split("|", 2)[1],
						subject_token: serviceAuthData.access_token,
						...requestToken.form,
					}),
					axiosOptions
				);
				req.query.access_token = userAccessData.access_token;
			} catch (err) {
				// Log Keycloak error and redirect without access_token, user will have to manually login
				req.log.error({ req, err }, err.message);
			}
		});
	}
}

module.exports = fp(plugin, {
	fastify: "4.x",
	name: "keycloak-access-token",
});
