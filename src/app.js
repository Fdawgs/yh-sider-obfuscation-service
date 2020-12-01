const Fastify = require('fastify');

// Import plugins
const helmet = require('fastify-helmet');

// Import service routes
const wildcardService = require('./services/wildcard.service');

/**
 * @author Frazer Smith
 * @description Build Fastify instance
 * @param {object} fastifyOpts - Fastify configuration values
 * @param {object} appOpts - App configuration values
 * @returns {} Fastify instance
 */
function build(fastifyOpts, appOpts) {
	const fastify = Fastify(fastifyOpts);

	// Register security plugins/middleware
	// Use Helmet to set response security headers: https://helmetjs.github.io/
	fastify.register(helmet);

	// Register service routes
	fastify.register(wildcardService, appOpts);

	return fastify;
}

module.exports = build;
