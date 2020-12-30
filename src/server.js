const autoLoad = require("fastify-autoload");
const fastifyPlugin = require("fastify-plugin");
const path = require("path");

// Import plugins
const cors = require("fastify-cors");
const helmet = require("fastify-helmet");

/**
 * @author Frazer Smith
 * @description Build Fastify instance
 * @param {Function} server - Fastify instance.
 * @param {object} config - Fastify configuration values
 */
async function plugin(server, config) {
	// Enable plugins
	// Use CORS: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
	server.register(cors, config.cors);

	// Use Helmet to set response security headers: https://helmetjs.github.io/
	server.register(helmet);

	// Import and register service routes
	server.register(autoLoad, {
		dir: path.join(__dirname, "routes"),
		options: config,
	});
}

module.exports = fastifyPlugin(plugin);
