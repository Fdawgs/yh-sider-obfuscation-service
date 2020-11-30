// eslint-disable-next-line import/order
const { fastifyConfig, appConfig } = require('./config');
const fastify = require('fastify')(fastifyConfig);

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
 * @description Start Fastify server instance.
 */
async function start() {
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
	fastify.register(wildcardService, appConfig);

	try {
		await fastify.listen(
			process.env.SERVICE_PORT,
			process.env.SERVICE_HOST,
			(err, address) => {
				if (err) {
					fastify.log.error(err);
					process.exit(1);
				}
				fastify.log.info(`server listening on ${address}`);
			}
		);
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
}
start();
