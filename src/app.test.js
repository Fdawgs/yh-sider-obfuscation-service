const cloneDeep = require('lodash/cloneDeep');
const faker = require('faker/locale/en_GB');
const queryString = require('querystring');
const build = require('./app');

const { appConfig, fastifyConfig } = require('./config');

const headers = {
	'Content-Type': 'application/json',
	'cache-control': 'no-cache'
};

const mockParams = {
	birthdate: faker.date.past().toISOString().split('T')[0],
	location: 'https://fhir.nhs.uk/Id/ods-organization-code|RA4',
	patient: `https://fhir.nhs.uk/Id/nhs-number|${faker.random.number({
		min: 1000000000,
		max: 9999999999
	})}`,
	practitioner: `https://sider.nhs.uk/auth|obsservice.test@ydh.nhs.uk`,
	TPAGID: faker.random.uuid(),
	FromIconProfile: faker.random.number(),
	NOUNLOCK: faker.random.number()
};

describe('App deployment', () => {
	describe('Redirects', () => {
		let app;

		beforeEach(() => {
			app = build(fastifyConfig, appConfig);
		});

		afterEach(() => {
			app.close();
		});

		test("Should redirect to Black Pear's ESP with required params present", async () => {
			const res = await app.inject({
				method: 'GET',
				url: '/',
				headers,
				query: mockParams
			});

			const resQueryString = queryString.parse(
				res.headers.location.substring(
					res.headers.location.indexOf('?') + 1,
					res.headers.location.length
				)
			);

			expect(res.headers.location).toMatch(
				'https://pyrusapps.blackpear.com/esp/#!/launch?'
			);

			expect(resQueryString).toMatchObject({
				location: 'https://fhir.nhs.uk/Id/ods-organization-code|RA4',
				practitioner:
					'https://sider.nhs.uk/auth|obsservice.test@ydh.nhs.uk',
				enc: expect.any(String)
			});

			expect(res.statusCode).toBe(302);
		});

		test('Should return HTTP 400 error when any required query string parameter is missing', async () => {
			const altMockParams = cloneDeep(mockParams);
			delete altMockParams.FromIconProfile;
			delete altMockParams.NOUNLOCK;
			delete altMockParams.TPAGID;

			const results = await Promise.all(
				Object.keys(altMockParams).map(async (key) => {
					const scrubbedParams = { ...altMockParams };
					delete scrubbedParams[key];

					const res = await app.inject({
						method: 'GET',
						url: '/',
						headers,
						query: scrubbedParams
					});

					return res.statusCode;
				})
			);

			expect(results).toEqual(
				expect.arrayContaining([400, 400, 400, 400])
			);
		});

		test('Should return HTTP 400 error when any required query string parameter does not match expected pattern', async () => {
			const altMockParams = cloneDeep(mockParams);
			delete altMockParams.FromIconProfile;
			delete altMockParams.NOUNLOCK;
			delete altMockParams.TPAGID;

			const results = await Promise.all(
				Object.keys(altMockParams).map(async (key) => {
					const scrubbedParams = { ...altMockParams };
					scrubbedParams[key] = 'test';

					const res = await app.inject({
						method: 'GET',
						url: '/',
						headers,
						query: scrubbedParams
					});

					return res.statusCode;
				})
			);

			expect(results).toEqual(
				expect.arrayContaining([400, 400, 400, 400])
			);
		});
	});

	describe('Keycloak token retrival', () => {
		test('Should continue when Keycloak endpoint config is disabled', async () => {
			const altAppConfig = cloneDeep(appConfig);
			altAppConfig.keycloak.enabled = 'false';

			const app = build(fastifyConfig, altAppConfig);

			const res = await app.inject({
				method: 'GET',
				url: '/',
				headers,
				query: mockParams
			});

			expect(res.headers.location).toMatch(
				'https://pyrusapps.blackpear.com/esp/#!/launch?'
			);
			expect(res.statusCode).toBe(302);

			app.close();
		});

		test('Should return HTTP 500 error when Keycloak endpoint config enabled but other options undefined', async () => {
			const altAppConfig = cloneDeep(appConfig);
			altAppConfig.keycloak.enabled = 'true';

			const app = build(fastifyConfig, altAppConfig);

			const res = await app.inject({
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

			app.close();
		});

		test('Should return HTTP 500 error when redirect URL missing', async () => {
			const altAppConfig = cloneDeep(appConfig);
			delete altAppConfig.redirectUrl;

			const app = build(fastifyConfig, altAppConfig);

			const res = await app.inject({
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

			app.close();
		});
	});
});
