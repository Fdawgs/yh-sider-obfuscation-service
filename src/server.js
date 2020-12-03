const { appConfig, fastifyConfig } = require('./config');
const app = require('./app');

/**
 * @author Frazer Smith
 * @description Start server
 */
const server = app(fastifyConfig, appConfig);
try {
	server.listen(process.env.SERVICE_PORT, process.env.SERVICE_HOST);
} catch (err) {
	// eslint-disable-next-line no-console
	console.log('Error starting server:', err);
	process.exit(1);
}
