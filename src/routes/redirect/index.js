const createError = require("http-errors");
const fp = require("fastify-plugin");
const queryString = require("querystring");

// Import plugins
const cors = require("fastify-cors");

const { redirectGetSchema } = require("./schema");

/**
 * @author Frazer Smith
 * @description Sets routing options for server.
 * @param {Function} server - Fastify instance.
 * @param {object} options - Object containing route config objects.
 */
async function route(server, options) {
	// Use CORS: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
	server.register(cors, {
		...options.cors,
		methods: ["GET"],
		hideOptionsRoute: true,
	});

	server.route({
		method: "GET",
		url: "/redirect",
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

module.exports = fp(route);
