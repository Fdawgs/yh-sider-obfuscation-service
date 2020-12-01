const AutoLoad = require('fastify-autoload');
const Fastify = require('fastify');
const path = require('path');

// Import plugins
const helmet = require('fastify-helmet');

/**
 * @author Frazer Smith
 * @description Build Fastify instance
 * @param {object} fastifyOpts - Fastify configuration values
 * @param {object} opts - App configuration values
 * @returns {} Fastify instance
 */
module.exports = (fastifyOpts, opts) => {
	const fastify = Fastify(fastifyOpts);

	// Register security plugins/middleware
	// Use Helmet to set response security headers: https://helmetjs.github.io/
	fastify.register(helmet);

	// Import and register service routes
	fastify.register(AutoLoad, {
		dir: path.join(__dirname, 'routes'),
		options: { ...opts }
	});

	// fastify.register(wildcardService, appOpts);

	return fastify;
};
