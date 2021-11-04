const { URLSearchParams } = require("url");

// Import plugins
const cors = require("fastify-cors");

const { redirectGetSchema } = require("./schema");

/**
 * @author Frazer Smith
 * @description Sets routing options for server.
 * @param {Function} server - Fastify instance.
 * @param {object} options - Route config values.
 * @param {object} options.cors - CORS settings.
 * @param {string} options.redirectUrl - URL and port the Mirth Connect FHIR/HTTP Listener channel is listening on.
 */
async function route(server, options) {
	// Register plugins
	server
		// Use CORS: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
		.register(cors, {
			...options.cors,
			methods: ["GET"],
		});

	server.addHook("preValidation", async (req, res) => {
		if (
			// Catch unsupported Accept header media types
			!redirectGetSchema.produces.includes(
				req.accepts().type(redirectGetSchema.produces)
			)
		) {
			res.notAcceptable();
		}
	});

	server.route({
		method: "GET",
		url: "/",
		schema: redirectGetSchema,
		handler(req, res) {
			const espUrl =
				options.redirectUrl + new URLSearchParams(req.query).toString();
			server.log.debug(espUrl);
			// eslint-disable-next-line security-node/detect-dangerous-redirects
			res.redirect(espUrl);
		},
	});
}

module.exports = route;
