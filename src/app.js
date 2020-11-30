const Fastify = require('fastify');

// Import plugins
const middie = require('middie');
const helmet = require('fastify-helmet');

// Import expressJS middleware
const hpp = require('hpp');
const sanitize = require('sanitize-middleware');

// Import service routes
const wildcardService = require('./services/wildcard.service');

/**
 * @author Frazer Smith
 * @description Build Fastify instance
 * @param {object} fastifyOpts - Fastify configuration values
 * @param {object} appOpts - App configuration values
 * @returns {} Fastify instance
 */
async function build(fastifyOpts, appOpts) {
	const fastify = Fastify(fastifyOpts);

	// Enable use of ExpressJS middleware
	await fastify.register(middie);

	// Protect against HPP attacks
	fastify.use(hpp());

	// Sanitize user input to protect against XSS and CLI attacks
	fastify.use(sanitize());

	// Register security plugins/middleware
	// Use Helmet to set response security headers: https://helmetjs.github.io/
	fastify.register(helmet);

	// Register service routes
	fastify.register(wildcardService, appOpts);

	return fastify;
}

module.exports = build;
