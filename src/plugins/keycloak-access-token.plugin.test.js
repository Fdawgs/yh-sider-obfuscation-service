/* eslint-disable no-console */
const cloneDeep = require('lodash/cloneDeep');
const faker = require('faker/locale/en_GB');
const Fastify = require('fastify');
const plugin = require('./keycloak-access-token.plugin');

const { keycloakRetrieveConfig } = require('../../mocks/keycloak-config.mock');
const mockKeycloakServer = require('../../mocks/keycloak-server.mock');

const { appConfig } = require('../config');

const headers = {
	'Content-Type': 'application/json',
	'cache-control': 'no-cache'
};

const mockParams = {
	birthdate: faker.date.past().toISOString().split('T')[0],
	location: 'https://fhir.nhs.uk/Id/ods-organization-code|RA4',
	patient: `https://fhir.nhs.uk/Id/nhs-number|${faker.random.number(10)}`,
	practitioner: `https://sider.nhs.uk/auth|obsservice.test@ydh.nhs.uk`
};

describe('Keycloak access token retrieval plugin', () => {
	let fastify;

	beforeAll(async () => {
		try {
			await mockKeycloakServer.listen(3000);
			console.log('Mock server listening on 3000');
		} catch (err) {
			console.log('Error starting server:', err);
			process.exit(1);
		}
	});

	beforeEach(() => {
		fastify = Fastify();

		fastify.get('/', (req, res) => {
			res.send(req.query);
		});
	});

	afterAll(async () => {
		await mockKeycloakServer.close();
	});

	afterEach(() => {
		fastify.close();
	});

	test('Should continue when Keycloak options are not defined', async () => {
		fastify.register(plugin);

		const res = await fastify.inject({
			method: 'GET',
			url: '/',
			headers,
			query: mockParams
		});

		expect(res.statusCode).toBe(200);
	});

	test('Should return Keycloak access_token', async () => {
		// console.log(keycloakRetrieveConfig);
		fastify.register(plugin, keycloakRetrieveConfig);

		const res = await fastify.inject({
			method: 'GET',
			url: '/',
			headers,
			query: mockParams
		});

		const body = JSON.parse(res.body);

		expect(res.statusCode).toBe(200);
		expect(body.access_token).not.toBeUndefined();
		expect(typeof body.access_token).toBe('string');
		expect(body.birthdate).not.toBeUndefined();
		expect(body.location).not.toBeUndefined();
		expect(body.patient).not.toBeUndefined();
		expect(body.practitioner).not.toBeUndefined();
	});

	test('Should return HTTP 500 error when Keycloak endpoint config enabled but other options undefined', async () => {
		const altAppConfig = cloneDeep(appConfig);
		altAppConfig.keycloak.enabled = 'true';

		fastify.register(plugin, altAppConfig.keycloak);

		const res = await fastify.inject({
			method: 'GET',
			url: '/',
			headers,
			query: mockParams
		});

		const body = JSON.parse(res.body);

		expect(res.statusCode).toBe(500);
		expect(res.statusMessage).toBe('Internal Server Error');
		expect(body.statusCode).toBe(500);
		expect(body.error).toBe('Internal Server Error');

		fastify.close();
	});
});
