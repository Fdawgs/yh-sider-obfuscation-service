// Import plugins
const cors = require("@fastify/cors");

const { redirectGetSchema } = require("./schema");

/**
 * @author Frazer Smith
 * @description Sets routing options for server.
 * @param {object} server - Fastify instance.
 * @param {object} options - Route config values.
 * @param {object} options.cors - CORS settings.
 * @param {string} options.redirectUrl - SIDeR service URL.
 */
async function route(server, options) {
	// Register plugins
	await server
		// Enable CORS if options passed
		.register(cors, {
			...options.cors,
			methods: ["GET"],
		});

	server.route({
		method: "GET",
		url: "/",
		schema: redirectGetSchema,
		preValidation: async (req, res) => {
			if (
				// Catch unsupported Accept header media types
				!req.accepts().type(redirectGetSchema.produces)
			) {
				throw res.notAcceptable();
			}
		},
		handler: async (req, res) => {
			/**
			 * Unable to use WHATWG URL API here to serialize URL,
			 * as the API treats hashes in shebangs as the start
			 * of a fragment
			 */
			const espUrl =
				options.redirectUrl + new URLSearchParams(req.query).toString();
			server.log.debug(espUrl);
			// eslint-disable-next-line security-node/detect-dangerous-redirects
			return res.redirect(espUrl);
		},
	});
}

module.exports = route;
