const autoLoad = require("@fastify/autoload");
const fp = require("fastify-plugin");
const path = require("upath");

// Import plugins
const accepts = require("@fastify/accepts");
const compress = require("@fastify/compress");
const disableCache = require("fastify-disablecache");
const flocOff = require("fastify-floc-off");
const helmet = require("@fastify/helmet");
const rateLimit = require("@fastify/rate-limit");
const sensible = require("@fastify/sensible");
const swagger = require("@fastify/swagger");
const underPressure = require("@fastify/under-pressure");
const sharedSchemas = require("./plugins/shared-schemas");

/**
 * @author Frazer Smith
 * @description Build Fastify instance.
 * @param {object} server - Fastify instance.
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

		// Opt-out of Google's FLoC advertising-surveillance network
		.register(flocOff)

		// Use Helmet to set response security headers: https://helmetjs.github.io/
		.register(helmet, config.helmet)

		// Utility functions and error handlers
		.register(sensible, { errorHandler: false })

		// Reusable schemas
		.register(sharedSchemas)

		// Enable Swagger/OpenAPI routes
		.register(swagger, config.swagger)

		// Process load and 503 response handling
		.register(underPressure, config.processLoad)

		// Rate limiting and 429 response handling
		.register(rateLimit, config.rateLimit);

	// Register routes
	await server
		/**
		 * `x-xss-protection` and `content-security-policy` is set by default by Helmet.
		 * These are only useful for HTML/XML content; the only CSP directive that
		 * is of use to other content is "frame-ancestors 'none'" to stop responses
		 * from being wrapped in iframes and used for clickjacking attacks.
		 */
		.addHook("onSend", (req, res, payload, next) => {
			if (
				res.getHeader("content-type") !== undefined &&
				!res.getHeader("content-type")?.includes("html") &&
				!res.getHeader("content-type")?.includes("xml")
			) {
				res.header(
					"content-security-policy",
					"default-src 'self';frame-ancestors 'none'"
				);
				res.raw.removeHeader("x-xss-protection");
			}

			next();
		})

		// Import and register admin routes
		.register(autoLoad, {
			dir: path.joinSafe(__dirname, "routes", "admin"),
			options: { ...config, prefix: "admin" },
		})

		// Import and register docs routes
		.register(autoLoad, {
			dir: path.joinSafe(__dirname, "routes", "docs"),
			options: { ...config, prefix: "docs" },
		})

		/**
		 * Encapsulate plugins and routes into secured child context, so that admin and docs
		 * routes do not inherit Keycloak or querystring obfuscation plugins.
		 * See https://www.fastify.io/docs/latest/Encapsulation/ for more info
		 */
		.register(async (securedContext) => {
			await securedContext
				.register(autoLoad, {
					dir: path.joinSafe(__dirname, "plugins"),
					ignorePattern: /shared-schemas/,
					options: config,
				})
				// Import and register service routes
				.register(autoLoad, {
					dir: path.joinSafe(__dirname, "routes", "redirect"),
					options: { ...config, prefix: "redirect" },
				});
		})

		// Rate limit 404 responses
		.setNotFoundHandler(
			{
				preHandler: server.rateLimit(),
			},
			async (req, res) =>
				res.notFound(`Route ${req.method}:${req.url} not found`)
		)

		// Errors thrown by routes and plugins are caught here
		.setErrorHandler(async (err, req, res) => {
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
