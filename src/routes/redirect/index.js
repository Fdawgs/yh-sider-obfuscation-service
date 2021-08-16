const queryString = require("querystring");

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
	// Use CORS: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
	server.register(cors, {
		...options.cors,
		methods: ["GET"],
		hideOptionsRoute: true,
	});

	server.addHook("onRequest", async (req, res) => {
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
		async handler(req, res) {
			if (!options.redirectUrl) {
				res.internalServerError("Recieving endpoint missing");
			}

			const espUrl =
				options.redirectUrl + queryString.stringify(req.query);
			server.log.debug(espUrl);
			res.redirect(espUrl);
		},
	});
}

module.exports = route;
