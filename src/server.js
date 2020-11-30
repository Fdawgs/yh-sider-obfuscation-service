const { appConfig, fastifyConfig } = require('./config');
const app = require('./app');

/**
 * @author Frazer Smith
 * @description Start server
 */
async function start() {
	const server = await app(fastifyConfig, appConfig);
	try {
		const address = await server.listen(
			process.env.SERVICE_PORT,
			process.env.SERVICE_HOST
		);
		server.log.info(`server listening on ${address}`);
	} catch (err) {
		console.log('Error starting server:', err);
		process.exit(1);
	}
}

start();
