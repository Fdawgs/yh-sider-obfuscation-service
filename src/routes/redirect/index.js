"use strict";

// Import plugins
const cors = require("@fastify/cors");
const { stringify: fastStringify } = require("fast-querystring");
const obfuscateQueryString = require("../../plugins/obfuscate-query-string");

const { redirectGetSchema } = require("./schema");

const accepts = ["text/html"];

/**
 * @author Frazer Smith
 * @description Sets routing options for server.
 * @param {import("fastify").FastifyInstance} server - Fastify instance.
 * @param {object} options - Route config values.
 * @param {object} options.cors - CORS settings.
 * @param {object} options.obfuscation - Obfuscation settings.
 * @param {object} options.obfuscation.encryptionKey - Object containing encryption key values.
 * @param {string} options.obfuscation.encryptionKey.name - Encryption key name.
 * @param {string} options.obfuscation.encryptionKey.value - Encryption key value.
 * @param {string[]} options.obfuscation.obfuscate - Query string params that should be obfuscated.
 * @param {string} options.redirectUrl - SIDeR service URL.
 * @param {*} [options.queryStringApiKeys] - Apply `apiKey` security scheme to route if defined.
 */
async function route(server, options) {
	if (options.queryStringApiKeys) {
		redirectGetSchema.security = [{ apiKey: [] }];
		redirectGetSchema.response[401] = {
			$ref: "responses#/properties/unauthorized",
			description: "Unauthorized",
		};
	}

	// Register plugins
	await server
		// Enable CORS if options passed
		.register(cors, {
			...options.cors,
			methods: ["GET", "HEAD"],
		})
		.register(obfuscateQueryString, options.obfuscation);

	server.route({
		method: "GET",
		url: "/",
		schema: redirectGetSchema,
		onRequest: async (req) => {
			if (
				// Catch unsupported Accept header media types
				!req.accepts().type(accepts)
			) {
				throw server.httpErrors.notAcceptable();
			}
		},
		handler: (req, res) => {
			/**
			 * Unable to use WHATWG URL API here to serialise URL,
			 * as the API treats hashes in shebangs as the start
			 * of a fragment.
			 */
			const espUrl = options.redirectUrl + fastStringify(req.query);
			server.log.debug(espUrl);
			// Redirecting to trusted ESP URL
			res.redirect(espUrl);
		},
	});
}

module.exports = route;
