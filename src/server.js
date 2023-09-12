"use strict";

const autoLoad = require("@fastify/autoload");
const fp = require("fastify-plugin");
const { joinSafe } = require("upath");

// Import plugins
const accepts = require("@fastify/accepts");
const compress = require("@fastify/compress");
const disableCache = require("fastify-disablecache");
const flocOff = require("fastify-floc-off");
const helmet = require("@fastify/helmet");
const rateLimit = require("@fastify/rate-limit");
const sensible = require("@fastify/sensible");
const serialiseJsonToXml = require("fastify-json-to-xml");
const staticPlugin = require("@fastify/static");
const swagger = require("@fastify/swagger");
const underPressure = require("@fastify/under-pressure");
const keycloakAccess = require("./plugins/keycloak-access-token");
const queryStringAuth = require("./plugins/query-string-auth");
const sharedSchemas = require("./plugins/shared-schemas");

/**
 * @author Frazer Smith
 * @description Builds Fastify instance.
 * @param {import("fastify").FastifyInstance} server - Fastify instance.
 * @param {object} config - Fastify configuration values.
 */
async function plugin(server, config) {
	// Register plugins
	await server
		// Accept header handler
		.register(accepts)

		// Support Content-Encoding
		.register(compress, { inflateIfDeflated: true })

		// Set response headers to disable client-side caching
		.register(disableCache)

		// Opt-out of Google's Topics advertising-surveillance API
		.register(flocOff)

		/**
		 * Use Helmet to set response security headers.
		 * @see {@link https://helmetjs.github.io | Helmet}
		 */
		.register(helmet, config.helmet)

		// Utility functions and error handlers
		.register(sensible)

		// Serialisation support for XML responses
		.register(serialiseJsonToXml)

		// Reusable schemas
		.register(sharedSchemas)

		// Generate OpenAPI/Swagger definitions
		.register(swagger, config.swagger)

		// Process load and 503 response handling
		.register(underPressure, config.processLoad)

		// Rate limiting and 429 response handling
		.register(rateLimit, config.rateLimit);

	// Register routes
	server
		/**
		 * Helmet sets `x-xss-protection` and `content-security-policy` by default.
		 * These are only useful for HTML/XML content; the only CSP directive that
		 * is of use to other content is "frame-ancestors 'none'" to stop responses
		 * from being wrapped in iframes and used for clickjacking attacks.
		 */
		.addHook("onSend", async (_req, res, payload) => {
			if (
				!res.getHeader("content-type")?.toString()?.includes("html") &&
				!res.getHeader("content-type")?.toString()?.includes("xml")
			) {
				res.header(
					"content-security-policy",
					"default-src 'self';frame-ancestors 'none'"
				);
				res.raw.removeHeader("x-xss-protection");
			}

			return payload;
		})

		// Import and register healthcheck route
		.register(autoLoad, {
			dir: joinSafe(__dirname, "routes", "admin", "healthcheck"),
			options: { ...config, prefix: "admin/healthcheck" },
		})

		/**
		 * Encapsulate plugins and routes into secured child context, so that admin and docs
		 * routes does not inherit Keycloak and query string API key auth plugins.
		 * @see {@link https://fastify.io/docs/latest/Reference/Encapsulation | Fastify Encapsulation}
		 */
		.register(async (securedContext) => {
			if (config.queryStringApiKeys) {
				await securedContext
					// Check query string contains API key
					.register(queryStringAuth, config.queryStringApiKeys);
			}

			await securedContext
				.register(keycloakAccess, config.keycloak)

				// Import and register service routes
				.register(autoLoad, {
					dir: joinSafe(__dirname, "routes", "redirect"),
					options: { ...config, prefix: "redirect" },
				});
		})

		/**
		 * Encapsulate the docs routes into a child context, so that the
		 * CSP can be relaxed, and cache enabled, without affecting
		 * security of other routes
		 */
		.register(async (publicContext) => {
			const relaxedHelmetConfig = structuredClone(config.helmet);
			Object.assign(
				relaxedHelmetConfig.contentSecurityPolicy.directives,
				{
					"script-src": ["'self'", "'unsafe-inline'"],
					"style-src": ["'self'", "'unsafe-inline'"],
				}
			);

			await publicContext
				// Set relaxed response headers
				.register(helmet, relaxedHelmetConfig)

				// Stop fastify-disablecache overwriting @fastify/static's cache headers
				.addHook("onRequest", async (_req, res) => {
					res.removeHeader("cache-control")
						.removeHeader("expires")
						.removeHeader("pragma")
						.removeHeader("surrogate-control");
				})

				// Register static files in public
				.register(staticPlugin, {
					root: joinSafe(__dirname, "public"),
					immutable: true,
					maxAge: "365 days",
					prefix: "/public/",
					wildcard: false,
				})
				.register(autoLoad, {
					dir: joinSafe(__dirname, "routes", "docs"),
					options: { ...config, prefix: "docs" },
				});
		})

		// Rate limit 404 responses
		.setNotFoundHandler(
			{
				preHandler: server.rateLimit(),
			},
			(req, res) => {
				res.notFound(`Route ${req.method}:${req.url} not found`);
			}
		)

		// Errors thrown by routes and plugins are caught here
		// eslint-disable-next-line promise/prefer-await-to-callbacks
		.setErrorHandler(async (err, _req, res) => {
			/**
			 * Catch 5xx errors, log them, and return a generic 500
			 * response. This avoids leaking internal server error details
			 * to the client
			 */
			if (
				(err.statusCode >= 500 &&
					/* istanbul ignore next: under-pressure plugin throws valid 503s */
					err.statusCode !== 503) ||
				/**
				 * Uncaught errors will have a res.statusCode but not
				 * an err.statusCode as @fastify/sensible sets that
				 */
				(res.statusCode === 200 && !err.statusCode)
			) {
				res.log.error(err);
				throw server.httpErrors.internalServerError();
			}

			throw err;
		});
}

module.exports = fp(plugin, { fastify: "4.x", name: "server" });
