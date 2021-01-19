const faker = require("faker/locale/en_GB");
const getConfig = require(".");

describe("configuration", () => {
	const currentEnv = { ...process.env };

	beforeAll(() => {
		jest.resetModules();
	});

	afterEach(() => {
		jest.resetModules();
		Object.assign(process.env, currentEnv);
	});

	test("Should return values according to environment variables - SSL enabled and CORS disabled", async () => {
		const NODE_ENV = "development";
		const SERVICE_HOST = faker.internet.ip();
		const SERVICE_PORT = faker.random.number();
		const SERVICE_REDIRECT_URL =
			"https://pyrusapps.blackpear.com/esp/#!/launch?";
		const HTTPS_SSL_CERT_PATH =
			"./test_resources/test_ssl_cert/server.cert";
		const HTTPS_SSL_KEY_PATH = "./test_resources/test_ssl_cert/server.key";
		const CORS_ORIGIN = false;
		const LOG_LEVEL = faker.random.arrayElement([
			"debug",
			"warn",
			"silent",
		]);
		const KC_ENABLED = false;
		const OBFUSCATION_KEY_NAME = "k01";
		const OBFUSCATION_KEY_VALUE = "0123456789";
		const OBFUSCATION_QUERYSTRING_KEY_ARRAY = '["birthdate", "patient"]';

		Object.assign(process.env, {
			NODE_ENV,
			SERVICE_HOST,
			SERVICE_PORT,
			SERVICE_REDIRECT_URL,
			HTTPS_SSL_CERT_PATH,
			HTTPS_SSL_KEY_PATH,
			CORS_ORIGIN,
			LOG_LEVEL,
			KC_ENABLED,
			OBFUSCATION_KEY_NAME,
			OBFUSCATION_KEY_VALUE,
			OBFUSCATION_QUERYSTRING_KEY_ARRAY,
		});

		const config = await getConfig();

		expect(config.isProduction).toEqual(false);

		expect(config.fastify).toEqual({
			host: SERVICE_HOST,
			port: SERVICE_PORT,
		});

		expect(config.fastifyInit.logger).toEqual(
			expect.objectContaining({
				formatters: { level: expect.any(Function) },
				level: LOG_LEVEL,
				serializers: {
					req: expect.any(Function),
					res: expect.any(Function),
				},
				timestamp: expect.any(Function),
			})
		);

		expect(config.fastifyInit.https).toEqual({
			cert: expect.any(Buffer),
			key: expect.any(Buffer),
		});

		expect(config.cors).toEqual({
			origin: CORS_ORIGIN,
			methods: ["Accept"],
			allowedHeaders: ["GET", "OPTIONS"],
		});

		expect(config.redirectUrl).toEqual(SERVICE_REDIRECT_URL);

		expect(config.keycloak.enabled).toEqual(false);

		expect(config.obfuscation).toEqual({
			encryptionKey: {
				name: OBFUSCATION_KEY_NAME,
				value: OBFUSCATION_KEY_VALUE,
			},
			obfuscate: JSON.parse(OBFUSCATION_QUERYSTRING_KEY_ARRAY),
		});
	});

	test("Should return values according to environment variables - PFX enabled and CORS enabled", async () => {
		const SERVICE_HOST = faker.internet.ip();
		const SERVICE_PORT = faker.random.number();
		const SERVICE_REDIRECT_URL =
			"https://pyrusapps.blackpear.com/esp/#!/launch?";
		const HTTPS_PFX_FILE_PATH =
			"./test_resources/test_ssl_cert/server.cert"; // I know it's not an actual PFX file
		const HTTPS_PFX_PASSPHRASE = faker.lorem.word();
		const CORS_ORIGIN = true;
		const LOG_LEVEL = faker.random.arrayElement([
			"debug",
			"warn",
			"silent",
		]);
		const KC_ENABLED = false;
		const OBFUSCATION_KEY_NAME = "k01";
		const OBFUSCATION_KEY_VALUE = "0123456789";
		const OBFUSCATION_QUERYSTRING_KEY_ARRAY = '["birthdate", "patient"]';

		Object.assign(process.env, {
			SERVICE_HOST,
			SERVICE_PORT,
			SERVICE_REDIRECT_URL,
			HTTPS_PFX_FILE_PATH,
			HTTPS_PFX_PASSPHRASE,
			CORS_ORIGIN,
			LOG_LEVEL,
			KC_ENABLED,
			OBFUSCATION_KEY_NAME,
			OBFUSCATION_KEY_VALUE,
			OBFUSCATION_QUERYSTRING_KEY_ARRAY,
		});

		const config = await getConfig();

		expect(config.fastify).toEqual({
			host: SERVICE_HOST,
			port: SERVICE_PORT,
		});

		expect(config.fastifyInit.https).toEqual({
			passphrase: HTTPS_PFX_PASSPHRASE,
			pfx: expect.any(Buffer),
		});

		expect(config.cors).toEqual({
			origin: CORS_ORIGIN,
			methods: ["Accept"],
			allowedHeaders: ["GET", "OPTIONS"],
		});
	});

	test("Should return values according to environment variables - HTTPS disabled and CORS set to value", async () => {
		const SERVICE_HOST = faker.internet.ip();
		const SERVICE_PORT = faker.random.number();
		const SERVICE_REDIRECT_URL =
			"https://pyrusapps.blackpear.com/esp/#!/launch?";
		const CORS_ORIGIN = "https://ydh.nhs.uk";
		const LOG_LEVEL = faker.random.arrayElement([
			"debug",
			"warn",
			"silent",
		]);
		const KC_ENABLED = false;
		const OBFUSCATION_KEY_NAME = "k01";
		const OBFUSCATION_KEY_VALUE = "0123456789";
		const OBFUSCATION_QUERYSTRING_KEY_ARRAY = '["birthdate", "patient"]';

		Object.assign(process.env, {
			SERVICE_HOST,
			SERVICE_PORT,
			SERVICE_REDIRECT_URL,
			CORS_ORIGIN,
			LOG_LEVEL,
			KC_ENABLED,
			OBFUSCATION_KEY_NAME,
			OBFUSCATION_KEY_VALUE,
			OBFUSCATION_QUERYSTRING_KEY_ARRAY,
		});

		const config = await getConfig();

		expect(config.fastify).toEqual({
			host: SERVICE_HOST,
			port: SERVICE_PORT,
		});

		expect(config.cors).toEqual({
			origin: CORS_ORIGIN,
			methods: ["Accept"],
			allowedHeaders: ["GET", "OPTIONS"],
		});
	});

	test("Should throw error if invalid PFX file path", async () => {
		const SERVICE_HOST = faker.internet.ip();
		const SERVICE_PORT = faker.random.number();
		const SERVICE_REDIRECT_URL =
			"https://pyrusapps.blackpear.com/esp/#!/launch?";
		const HTTPS_PFX_FILE_PATH = "./test_resources/test_ssl_cert/error.pfx";
		const HTTPS_PFX_PASSPHRASE = faker.lorem.word();
		const CORS_ORIGIN = true;
		const LOG_LEVEL = faker.random.arrayElement([
			"debug",
			"warn",
			"silent",
		]);
		const KC_ENABLED = false;
		const OBFUSCATION_KEY_NAME = "k01";
		const OBFUSCATION_KEY_VALUE = "0123456789";
		const OBFUSCATION_QUERYSTRING_KEY_ARRAY = '["birthdate", "patient"]';

		Object.assign(process.env, {
			SERVICE_HOST,
			SERVICE_PORT,
			SERVICE_REDIRECT_URL,
			HTTPS_PFX_FILE_PATH,
			HTTPS_PFX_PASSPHRASE,
			CORS_ORIGIN,
			LOG_LEVEL,
			KC_ENABLED,
			OBFUSCATION_KEY_NAME,
			OBFUSCATION_KEY_VALUE,
			OBFUSCATION_QUERYSTRING_KEY_ARRAY,
		});

		await expect(getConfig()).rejects.toThrow();
	});

	test("Should throw error if invalid SSL cert file path", async () => {
		const SERVICE_HOST = faker.internet.ip();
		const SERVICE_PORT = faker.random.number();
		const SERVICE_REDIRECT_URL =
			"https://pyrusapps.blackpear.com/esp/#!/launch?";
		const HTTPS_SSL_CERT_PATH = "./test_resources/test_ssl_cert/error.cert";
		const HTTPS_SSL_KEY_PATH = "./test_resources/test_ssl_cert/error.key";
		const CORS_ORIGIN = true;
		const LOG_LEVEL = faker.random.arrayElement([
			"debug",
			"warn",
			"silent",
		]);
		const KC_ENABLED = false;
		const OBFUSCATION_KEY_NAME = "k01";
		const OBFUSCATION_KEY_VALUE = "0123456789";
		const OBFUSCATION_QUERYSTRING_KEY_ARRAY = '["birthdate", "patient"]';

		Object.assign(process.env, {
			SERVICE_HOST,
			SERVICE_PORT,
			SERVICE_REDIRECT_URL,
			HTTPS_SSL_CERT_PATH,
			HTTPS_SSL_KEY_PATH,
			CORS_ORIGIN,
			LOG_LEVEL,
			KC_ENABLED,
			OBFUSCATION_KEY_NAME,
			OBFUSCATION_KEY_VALUE,
			OBFUSCATION_QUERYSTRING_KEY_ARRAY,
		});

		await expect(getConfig()).rejects.toThrow();
	});
});
