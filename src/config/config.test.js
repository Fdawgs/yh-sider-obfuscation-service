const faker = require("faker/locale/en_GB");
const fs = require("fs");
const glob = require("glob");
const getConfig = require(".");

describe("Configuration", () => {
	const currentEnv = { ...process.env };

	beforeAll(() => {
		jest.resetModules();
	});

	afterAll(() => {
		const files = glob.GlobSync(`./test_resources/test_log*`).found;
		files.forEach((foundFile) => {
			fs.unlinkSync(foundFile);
		});
	});

	afterEach(() => {
		jest.resetModules();
		Object.assign(process.env, currentEnv);
	});

	test("Should return values according to environment variables - SSL enabled and CORS disabled", async () => {
		const NODE_ENV = "development";
		const SERVICE_HOST = faker.internet.ip();
		const SERVICE_PORT = faker.datatype.number();
		const SERVICE_REDIRECT_URL =
			"https://pyrusapps.blackpear.com/esp/#!/launch?";
		const HTTPS_SSL_CERT_PATH =
			"./test_resources/test_ssl_cert/server.cert";
		const HTTPS_SSL_KEY_PATH = "./test_resources/test_ssl_cert/server.key";
		const CORS_ORIGIN = false;
		const CORS_ALLOWED_HEADERS = "";
		const CORS_ALLOW_CREDENTIALS = "";
		const LOG_LEVEL = faker.random.arrayElement([
			"debug",
			"warn",
			"silent",
		]);
		const LOG_ROTATION_FILENAME = "./test_resources/test_log";
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
			CORS_ALLOWED_HEADERS,
			CORS_ALLOW_CREDENTIALS,
			LOG_LEVEL,
			LOG_ROTATION_FILENAME,
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
				stream: expect.any(Object),
			})
		);

		expect(config.fastifyInit.https).toEqual({
			cert: expect.any(Buffer),
			key: expect.any(Buffer),
		});

		expect(config.cors).toEqual({
			origin: CORS_ORIGIN,
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
		const SERVICE_PORT = faker.datatype.number();
		const SERVICE_REDIRECT_URL =
			"https://pyrusapps.blackpear.com/esp/#!/launch?";
		const HTTPS_PFX_FILE_PATH =
			"./test_resources/test_ssl_cert/server.cert"; // I know it's not an actual PFX file
		const HTTPS_PFX_PASSPHRASE = faker.lorem.word();
		const CORS_ORIGIN = true;
		const CORS_ALLOWED_HEADERS = "";
		const CORS_ALLOW_CREDENTIALS = true;
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
			CORS_ALLOWED_HEADERS,
			CORS_ALLOW_CREDENTIALS,
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
			credentials: CORS_ALLOW_CREDENTIALS,
			origin: CORS_ORIGIN,
		});
	});

	test("Should return values according to environment variables - HTTPS disabled and CORS set to string value", async () => {
		const SERVICE_HOST = faker.internet.ip();
		const SERVICE_PORT = faker.datatype.number();
		const SERVICE_REDIRECT_URL =
			"https://pyrusapps.blackpear.com/esp/#!/launch?";
		const CORS_ORIGIN = "https://ydh.nhs.uk";
		const CORS_ALLOWED_HEADERS =
			"Accept, Authorization, Content-Type, Origin, X-Requested-With";
		const CORS_ALLOW_CREDENTIALS = "";
		const CORS_EXPOSED_HEADERS = "Location";
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
			CORS_ALLOWED_HEADERS,
			CORS_ALLOW_CREDENTIALS,
			CORS_EXPOSED_HEADERS,
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
			allowedHeaders: CORS_ALLOWED_HEADERS,
			exposedHeaders: CORS_EXPOSED_HEADERS,
		});
	});

	test("Should return values according to environment variables - HTTPS disabled and CORS set to comma-delimited string value", async () => {
		const SERVICE_HOST = faker.internet.ip();
		const SERVICE_PORT = faker.datatype.number();
		const SERVICE_REDIRECT_URL =
			"https://pyrusapps.blackpear.com/esp/#!/launch?";
		const CORS_ORIGIN =
			"https://test1.ydh.nhs.uk, https://test2.ydh.nhs.uk";
		const CORS_ALLOWED_HEADERS =
			"Accept, Authorization, Content-Type, Origin, X-Requested-With";
		const CORS_ALLOW_CREDENTIALS = "";
		const CORS_EXPOSED_HEADERS = "Location";
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
			CORS_ALLOWED_HEADERS,
			CORS_ALLOW_CREDENTIALS,
			CORS_EXPOSED_HEADERS,
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
			origin: expect.arrayContaining([
				"https://test1.ydh.nhs.uk",
				"https://test2.ydh.nhs.uk",
			]),
			allowedHeaders: CORS_ALLOWED_HEADERS,
			exposedHeaders: CORS_EXPOSED_HEADERS,
		});
	});

	test("Should throw error if invalid PFX file path", async () => {
		const SERVICE_HOST = faker.internet.ip();
		const SERVICE_PORT = faker.datatype.number();
		const SERVICE_REDIRECT_URL =
			"https://pyrusapps.blackpear.com/esp/#!/launch?";
		const HTTPS_PFX_FILE_PATH = "./test_resources/test_ssl_cert/error.pfx";
		const HTTPS_PFX_PASSPHRASE = faker.lorem.word();
		const CORS_ORIGIN = true;
		const CORS_ALLOWED_HEADERS = "";
		const CORS_ALLOW_CREDENTIALS = "";
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
			CORS_ALLOWED_HEADERS,
			CORS_ALLOW_CREDENTIALS,
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
		const SERVICE_PORT = faker.datatype.number();
		const SERVICE_REDIRECT_URL =
			"https://pyrusapps.blackpear.com/esp/#!/launch?";
		const HTTPS_SSL_CERT_PATH = "./test_resources/test_ssl_cert/error.cert";
		const HTTPS_SSL_KEY_PATH = "./test_resources/test_ssl_cert/error.key";
		const CORS_ORIGIN = true;
		const CORS_ALLOWED_HEADERS = "";
		const CORS_ALLOW_CREDENTIALS = "";
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
			CORS_ALLOWED_HEADERS,
			CORS_ALLOW_CREDENTIALS,
			LOG_LEVEL,
			KC_ENABLED,
			OBFUSCATION_KEY_NAME,
			OBFUSCATION_KEY_VALUE,
			OBFUSCATION_QUERYSTRING_KEY_ARRAY,
		});

		await expect(getConfig()).rejects.toThrow();
	});
});
