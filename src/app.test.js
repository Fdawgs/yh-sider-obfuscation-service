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
	patient: `https://fhir.nhs.uk/Id/nhs-number|${faker.random.number(10)}`,
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

		test('Should return HTTP 400 error when any required param is missing', async () => {
			const alteredParams = { ...mockParams };
			delete alteredParams.NOUNLOCK;
			delete alteredParams.TPAGID;
			delete alteredParams.FromIconProfile;

			await Promise.all(
				Object.keys(alteredParams).map(async (key) => {
					const scrubbedParams = { ...alteredParams };
					delete scrubbedParams[key];
					await app
						.inject({
							method: 'GET',
							url: '/',
							headers,
							query: mockParams
						})
						.catch((err) => {
							expect(err.status).toBe(400);
						});
				})
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

		test('Should return HTTP 500 error when Keycloak endpoint config enabled but other values missing', async () => {
			const altAppConfig = cloneDeep(appConfig);
			altAppConfig.keycloak.enabled = 'true';

			const app = build(fastifyConfig, altAppConfig);

			const res = await app.inject({
				method: 'GET',
				url: '/',
				headers,
				query: mockParams
			});

			expect(res.statusCode).toBe(500);

			app.close();
		});
	});
});
