const createError = require("http-errors");
const fastifyPlugin = require("fastify-plugin");
const queryString = require("querystring");

const { redirectGetSchema } = require("./schema");

/**
 * @author Frazer Smith
 * @description Sets routing options for server.
 * @param {Function} server - Fastify instance.
 * @param {object} options - Object containing route config objects.
 */
async function route(server, options) {
	/**
	 * Fastify uses AJV for JSON Schema Validation,
	 * see https://www.fastify.io/docs/latest/Validation-and-Serialization/
	 *
	 * This validation protects against XSS and HPP attacks.
	 */
	server.route({
		method: "GET",
		url: "/redirect",
		prefixTrailingSlash: "no-slash",
		schema: redirectGetSchema,
		async handler(req, res) {
			if (!options.redirectUrl) {
				res.send(createError(500, "Recieving endpoint missing"));
			}

			const espUrl =
				options.redirectUrl + queryString.stringify(req.query);
			server.log.debug(espUrl);
			res.redirect(espUrl);
		},
	});
}

module.exports = fastifyPlugin(route);
