const fs = require("fs/promises");
const { glob } = require("glob");
const getConfig = require(".");

describe("Configuration", () => {
	const currentEnv = { ...process.env, NODE_ENV: "development" };

	afterAll(async () => {
		const files = await glob("./test_resources/+(test-log*|.audit.json)", {
			dot: true,
		});

		// eslint-disable-next-line security/detect-non-literal-fs-filename
		await Promise.all(files.map((file) => fs.unlink(file)));
	});

	afterEach(() => {
		// Reset the process.env to default after each test
		Object.assign(process.env, currentEnv);
	});

	test("Should use defaults if values missing and return values according to environment variables", async () => {
		const HOST = "";
		const PORT = "";
		const REDIRECT_URL = "https://pyrusapps.blackpear.com/esp/#!/launch?";
		const CORS_ORIGIN = "";
		const CORS_ALLOWED_HEADERS = "";
		const CORS_ALLOW_CREDENTIALS = "";
		const CORS_EXPOSED_HEADERS = "";
		const CORS_MAX_AGE = "";
		const HTTPS_SSL_CERT_PATH = "";
		const HTTPS_SSL_KEY_PATH = "";
		const HTTPS_HTTP2_ENABLED = "";
		const LOG_LEVEL = "";
		const LOG_ROTATION_DATE_FORMAT = "";
		const LOG_ROTATION_FILENAME = "";
		const LOG_ROTATION_FREQUENCY = "";
		const PROC_LOAD_MAX_EVENT_LOOP_DELAY = "";
		const PROC_LOAD_MAX_HEAP_USED_BYTES = "";
		const PROC_LOAD_MAX_RSS_BYTES = "";
		const PROC_LOAD_MAX_EVENT_LOOP_UTILIZATION = "";
		const RATE_LIMIT_MAX_CONNECTIONS_PER_MIN = "";
		const RATE_LIMIT_EXCLUDED_ARRAY = "";
		const KC_ENABLED = "";
		const KC_REQUESTTOKEN_URL = "";
		const KC_SERVICEAUTH_URL = "";
		const OBFUSCATION_KEY_NAME = "k01";
		const OBFUSCATION_KEY_VALUE = "0123456789";
		const OBFUSCATION_QUERYSTRING_KEY_ARRAY = '["birthdate", "patient"]';
		const QUERY_STRING_API_KEY_ARRAY = "";

		Object.assign(process.env, {
			HOST,
			PORT,
			REDIRECT_URL,
			CORS_ORIGIN,
			CORS_ALLOWED_HEADERS,
			CORS_ALLOW_CREDENTIALS,
			CORS_EXPOSED_HEADERS,
			CORS_MAX_AGE,
			HTTPS_SSL_CERT_PATH,
			HTTPS_SSL_KEY_PATH,
			HTTPS_HTTP2_ENABLED,
			LOG_LEVEL,
			LOG_ROTATION_DATE_FORMAT,
			LOG_ROTATION_FILENAME,
			LOG_ROTATION_FREQUENCY,
			PROC_LOAD_MAX_EVENT_LOOP_DELAY,
			PROC_LOAD_MAX_EVENT_LOOP_UTILIZATION,
			PROC_LOAD_MAX_HEAP_USED_BYTES,
			PROC_LOAD_MAX_RSS_BYTES,
			RATE_LIMIT_MAX_CONNECTIONS_PER_MIN,
			RATE_LIMIT_EXCLUDED_ARRAY,
			KC_ENABLED,
			KC_REQUESTTOKEN_URL,
			KC_SERVICEAUTH_URL,
			OBFUSCATION_KEY_NAME,
			OBFUSCATION_KEY_VALUE,
			OBFUSCATION_QUERYSTRING_KEY_ARRAY,
			QUERY_STRING_API_KEY_ARRAY,
		});

		const config = await getConfig();

		expect(config.fastify).toEqual({
			port: 3000,
		});

		expect(config.fastifyInit.logger).toEqual({
			formatters: { level: expect.any(Function) },
			level: "info",
			redact: ["req.headers.authorization"],
			serializers: {
				req: expect.any(Function),
				res: expect.any(Function),
			},
			timestamp: expect.any(Function),
		});
		expect(config.fastifyInit.logger.formatters.level()).toEqual({
			level: undefined,
		});
		expect(config.fastifyInit.logger.timestamp()).toMatch(/^,"time"/);

		expect(config.fastifyInit.https).toBeUndefined();
		expect(config.fastifyInit.http2).toBeUndefined();

		expect(config.cors).toEqual({
			allowedHeaders: null,
			credentials: false,
			exposedHeaders: null,
			hideOptionsRoute: true,
			maxAge: null,
			origin: false,
		});

		expect(config.processLoad).toEqual({
			maxEventLoopDelay: 0,
			maxEventLoopUtilization: 0,
			maxHeapUsedBytes: 0,
			maxRssBytes: 0,
		});

		expect(config.rateLimit).toEqual({
			allowList: null,
			continueExceeding: true,
			hook: "onSend",
			max: 1000,
			timeWindow: 60000,
		});

		expect(config.redirectUrl).toBe(REDIRECT_URL);

		expect(config.keycloak.enabled).toBe(false);
		expect(config.keycloak.requestToken.url).toBeUndefined();
		expect(config.keycloak.serviceAuthorisation.url).toBeUndefined();

		expect(config.obfuscation).toEqual({
			encryptionKey: {
				name: OBFUSCATION_KEY_NAME,
				value: OBFUSCATION_KEY_VALUE,
			},
			obfuscate: JSON.parse(OBFUSCATION_QUERYSTRING_KEY_ARRAY),
		});

		expect(config.queryStringApiKeys).toBeUndefined();
	});

	test("Should use defaults logging values if values missing", async () => {
		const REDIRECT_URL = "https://pyrusapps.blackpear.com/esp/#!/launch?";
		const LOG_LEVEL = "";
		const LOG_ROTATION_DATE_FORMAT = "";
		const LOG_ROTATION_FILENAME = "./test_resources/test-log-%DATE%.log";
		const LOG_ROTATION_FREQUENCY = "";
		const OBFUSCATION_KEY_NAME = "k01";
		const OBFUSCATION_KEY_VALUE = "0123456789";
		const OBFUSCATION_QUERYSTRING_KEY_ARRAY = '["birthdate", "patient"]';

		Object.assign(process.env, {
			REDIRECT_URL,
			LOG_LEVEL,
			LOG_ROTATION_DATE_FORMAT,
			LOG_ROTATION_FILENAME,
			LOG_ROTATION_FREQUENCY,
			OBFUSCATION_KEY_NAME,
			OBFUSCATION_KEY_VALUE,
			OBFUSCATION_QUERYSTRING_KEY_ARRAY,
		});

		const config = await getConfig();

		expect(config.fastifyInit.logger).toEqual({
			formatters: { level: expect.any(Function) },
			level: "info",
			redact: ["req.headers.authorization"],
			serializers: {
				req: expect.any(Function),
				res: expect.any(Function),
			},
			stream: expect.any(Object),
			timestamp: expect.any(Function),
		});
		expect(config.fastifyInit.logger.formatters.level()).toEqual({
			level: undefined,
		});
		expect(config.fastifyInit.logger.stream.config.options).toEqual(
			expect.objectContaining({
				filename: LOG_ROTATION_FILENAME,
				date_format: "YYYY-MM-DD",
				frequency: "daily",
			})
		);
		expect(config.fastifyInit.logger.timestamp()).toMatch(/^,"time"/);
	});

	test("Should return values according to environment variables - HTTPS (SSL cert) enabled and HTTP2 enabled", async () => {
		const HOST = "0.0.0.0";
		const PORT = 443;
		const REDIRECT_URL = "https://pyrusapps.blackpear.com/esp/#!/launch?";
		const HTTPS_SSL_CERT_PATH =
			"./test_resources/test_ssl_cert/server.cert";
		const HTTPS_SSL_KEY_PATH = "./test_resources/test_ssl_cert/server.key";
		const HTTPS_HTTP2_ENABLED = true;
		const LOG_LEVEL = "trace";
		const LOG_ROTATION_DATE_FORMAT = "YYYY-MM";
		const LOG_ROTATION_FILENAME = "./test_resources/test-log-%DATE%.log";
		const LOG_ROTATION_FREQUENCY = "date";
		const LOG_ROTATION_MAX_LOGS = "10";
		const LOG_ROTATION_MAX_SIZE = "150k";
		const PROC_LOAD_MAX_EVENT_LOOP_DELAY = 1000;
		const PROC_LOAD_MAX_HEAP_USED_BYTES = 100000000;
		const PROC_LOAD_MAX_RSS_BYTES = 100000000;
		const PROC_LOAD_MAX_EVENT_LOOP_UTILIZATION = 0.98;
		const RATE_LIMIT_MAX_CONNECTIONS_PER_MIN = 2000;
		const RATE_LIMIT_EXCLUDED_ARRAY = '["127.0.0.1"]';
		const KC_ENABLED = false;
		const KC_REQUESTTOKEN_URL = "https://nhs.uk/request-token-url";
		const KC_SERVICEAUTH_URL = "https://nhs.uk/service-auth-url";
		const OBFUSCATION_KEY_NAME = "k01";
		const OBFUSCATION_KEY_VALUE = "0123456789";
		const OBFUSCATION_QUERYSTRING_KEY_ARRAY = '["birthdate", "patient"]';
		const QUERY_STRING_API_KEY_ARRAY =
			'[{"clientName": "test", "value": "testKey"}]';

		Object.assign(process.env, {
			HOST,
			PORT,
			REDIRECT_URL,
			HTTPS_SSL_CERT_PATH,
			HTTPS_SSL_KEY_PATH,
			HTTPS_HTTP2_ENABLED,
			LOG_LEVEL,
			LOG_ROTATION_DATE_FORMAT,
			LOG_ROTATION_FILENAME,
			LOG_ROTATION_FREQUENCY,
			LOG_ROTATION_MAX_LOGS,
			LOG_ROTATION_MAX_SIZE,
			PROC_LOAD_MAX_EVENT_LOOP_DELAY,
			PROC_LOAD_MAX_HEAP_USED_BYTES,
			PROC_LOAD_MAX_RSS_BYTES,
			PROC_LOAD_MAX_EVENT_LOOP_UTILIZATION,
			RATE_LIMIT_MAX_CONNECTIONS_PER_MIN,
			RATE_LIMIT_EXCLUDED_ARRAY,
			KC_ENABLED,
			KC_REQUESTTOKEN_URL,
			KC_SERVICEAUTH_URL,
			OBFUSCATION_KEY_NAME,
			OBFUSCATION_KEY_VALUE,
			OBFUSCATION_QUERYSTRING_KEY_ARRAY,
			QUERY_STRING_API_KEY_ARRAY,
		});

		const config = await getConfig();

		expect(config.fastify).toEqual({
			host: HOST,
			port: PORT,
		});

		expect(config.fastifyInit.logger).toEqual({
			formatters: { level: expect.any(Function) },
			level: LOG_LEVEL,
			redact: ["req.headers.authorization"],
			serializers: {
				req: expect.any(Function),
				res: expect.any(Function),
			},
			stream: expect.any(Object),
			timestamp: expect.any(Function),
		});
		expect(config.fastifyInit.logger.formatters.level()).toEqual({
			level: undefined,
		});
		expect(config.fastifyInit.logger.stream.config.options).toEqual(
			expect.objectContaining({
				date_format: LOG_ROTATION_DATE_FORMAT,
				filename: LOG_ROTATION_FILENAME,
				frequency: LOG_ROTATION_FREQUENCY,
				max_logs: LOG_ROTATION_MAX_LOGS,
				size: LOG_ROTATION_MAX_SIZE,
			})
		);
		expect(config.fastifyInit.logger.timestamp()).toMatch(/^,"time"/);

		expect(config.fastifyInit.https).toEqual({
			allowHTTP1: true,
			cert: expect.any(Buffer),
			key: expect.any(Buffer),
		});
		expect(config.fastifyInit.http2).toBe(true);

		expect(config.processLoad).toEqual({
			maxEventLoopDelay: PROC_LOAD_MAX_EVENT_LOOP_DELAY,
			maxEventLoopUtilization: PROC_LOAD_MAX_EVENT_LOOP_UTILIZATION,
			maxHeapUsedBytes: PROC_LOAD_MAX_HEAP_USED_BYTES,
			maxRssBytes: PROC_LOAD_MAX_RSS_BYTES,
		});

		expect(config.rateLimit).toEqual({
			allowList: JSON.parse(RATE_LIMIT_EXCLUDED_ARRAY),
			continueExceeding: true,
			hook: "onSend",
			max: RATE_LIMIT_MAX_CONNECTIONS_PER_MIN,
			timeWindow: 60000,
		});

		expect(config.redirectUrl).toBe(REDIRECT_URL);

		expect(config.keycloak.enabled).toBe(false);
		expect(config.keycloak.requestToken.url).toBe(KC_REQUESTTOKEN_URL);
		expect(config.keycloak.serviceAuthorisation.url).toBe(
			KC_SERVICEAUTH_URL
		);

		expect(config.obfuscation).toEqual({
			encryptionKey: {
				name: OBFUSCATION_KEY_NAME,
				value: OBFUSCATION_KEY_VALUE,
			},
			obfuscate: JSON.parse(OBFUSCATION_QUERYSTRING_KEY_ARRAY),
		});

		expect(config.queryStringApiKeys).toEqual({
			apiKeys: expect.any(Set),
			queryStringKey: "api_key",
		});
		expect(Array.from(config.queryStringApiKeys.apiKeys)).toEqual(
			expect.arrayContaining([
				{
					clientName: "test",
					value: "testKey",
				},
			])
		);
	});

	test("Should return values according to environment variables - HTTPS (PFX cert) enabled and HTTP2 enabled", async () => {
		const HOST = "0.0.0.0";
		const PORT = 443;
		const REDIRECT_URL = "https://pyrusapps.blackpear.com/esp/#!/launch?";
		const HTTPS_PFX_FILE_PATH =
			"./test_resources/test_ssl_cert/server.cert"; // Not an actual PFX file
		const HTTPS_PFX_PASSPHRASE = "TestPassphrase";
		const HTTPS_HTTP2_ENABLED = true;
		const LOG_LEVEL = "trace";
		const KC_ENABLED = false;
		const OBFUSCATION_KEY_NAME = "k01";
		const OBFUSCATION_KEY_VALUE = "0123456789";
		const OBFUSCATION_QUERYSTRING_KEY_ARRAY = '["birthdate", "patient"]';

		Object.assign(process.env, {
			HOST,
			PORT,
			REDIRECT_URL,
			HTTPS_PFX_FILE_PATH,
			HTTPS_PFX_PASSPHRASE,
			HTTPS_HTTP2_ENABLED,
			LOG_LEVEL,
			KC_ENABLED,
			OBFUSCATION_KEY_NAME,
			OBFUSCATION_KEY_VALUE,
			OBFUSCATION_QUERYSTRING_KEY_ARRAY,
		});

		const config = await getConfig();

		expect(config.fastify).toEqual({
			host: HOST,
			port: PORT,
		});

		expect(config.fastifyInit.https).toEqual({
			allowHTTP1: true,
			passphrase: HTTPS_PFX_PASSPHRASE,
			pfx: expect.any(Buffer),
		});
		expect(config.fastifyInit.http2).toBe(true);
	});

	// CORS env variables
	test.each([
		{
			testName: "CORS origin set to true and credentials enabled",
			envVariables: {
				CORS_ORIGIN: true,
				CORS_ALLOW_CREDENTIALS: true,
			},
			expected: {
				origin: true,
				credentials: true,
			},
		},
		{
			testName: "CORS origin set to false",
			envVariables: {
				CORS_ORIGIN: false,
			},
			expected: {
				origin: false,
			},
		},
		{
			testName: "CORS origin set to comma-delimited string value",
			envVariables: {
				CORS_ORIGIN:
					"https://test1.ydh.nhs.uk, https://test2.ydh.nhs.uk",
			},
			expected: {
				origin: expect.arrayContaining([
					"https://test1.ydh.nhs.uk",
					"https://test2.ydh.nhs.uk",
				]),
			},
		},
		{
			testName: "CORS origin set to string value",
			envVariables: {
				CORS_ORIGIN: "https://ydh.nhs.uk",
			},
			expected: {
				origin: "https://ydh.nhs.uk",
			},
		},
	])(
		"Should return values according to environment variables - $testName",
		async ({ envVariables, expected }) => {
			const HOST = "0.0.0.0";
			const PORT = 80;
			const REDIRECT_URL = "https://nhs.uk";
			const { CORS_ORIGIN } = envVariables;
			const CORS_ALLOWED_HEADERS =
				"Accept, Authorization, Content-Type, Origin, X-Requested-With";
			const CORS_ALLOW_CREDENTIALS =
				envVariables.CORS_ALLOW_CREDENTIALS || "";
			const CORS_EXPOSED_HEADERS = "Location";
			const CORS_MAX_AGE = 10;
			const LOG_LEVEL = "trace";
			const KC_ENABLED = false;
			const OBFUSCATION_KEY_NAME = "k01";
			const OBFUSCATION_KEY_VALUE = "0123456789";
			const OBFUSCATION_QUERYSTRING_KEY_ARRAY =
				'["birthdate", "patient"]';

			Object.assign(process.env, {
				HOST,
				PORT,
				REDIRECT_URL,
				CORS_ORIGIN,
				CORS_ALLOWED_HEADERS,
				CORS_ALLOW_CREDENTIALS,
				CORS_EXPOSED_HEADERS,
				CORS_MAX_AGE,
				LOG_LEVEL,
				KC_ENABLED,
				OBFUSCATION_KEY_NAME,
				OBFUSCATION_KEY_VALUE,
				OBFUSCATION_QUERYSTRING_KEY_ARRAY,
			});

			const config = await getConfig();

			expect(config.fastify).toEqual({
				host: HOST,
				port: PORT,
			});

			expect(config.cors).toEqual({
				origin: expected.origin,
				allowedHeaders: CORS_ALLOWED_HEADERS,
				credentials: expected.credentials || false,
				exposedHeaders: CORS_EXPOSED_HEADERS,
				hideOptionsRoute: true,
				maxAge: CORS_MAX_AGE,
			});
		}
	);

	// HTTPS cert path env variables
	test.each([
		{
			testName: "invalid PFX file path",
			envVariables: {
				HTTPS_PFX_FILE_PATH: "./test_resources/test_ssl_cert/error.pfx",
				HTTPS_PFX_PASSPHRASE: "TestPassphrase",
			},
		},
		{
			testName: "invalid SSL cert file path",
			envVariables: {
				HTTPS_SSL_CERT_PATH:
					"./test_resources/test_ssl_cert/error.cert",
				HTTPS_SSL_KEY_PATH: "./test_resources/test_ssl_cert/error.key",
			},
		},
	])("Should throw error if $testName", async ({ envVariables }) => {
		const HOST = "0.0.0.0";
		const PORT = 443;
		const REDIRECT_URL = "https://nhs.uk";
		const HTTPS_SSL_KEY_PATH = envVariables.HTTPS_SSL_KEY_PATH || "";
		const HTTPS_SSL_CERT_PATH = envVariables.HTTPS_SSL_CERT_PATH || "";
		const HTTPS_PFX_FILE_PATH = envVariables.HTTPS_PFX_FILE_PATH || "";
		const HTTPS_PFX_PASSPHRASE = envVariables.HTTPS_PFX_PASSPHRASE || "";
		const KC_ENABLED = false;
		const OBFUSCATION_KEY_NAME = "k01";
		const OBFUSCATION_KEY_VALUE = "0123456789";
		const OBFUSCATION_QUERYSTRING_KEY_ARRAY = '["birthdate", "patient"]';
		const LOG_LEVEL = "trace";

		Object.assign(process.env, {
			HOST,
			PORT,
			REDIRECT_URL,
			HTTPS_SSL_CERT_PATH,
			HTTPS_SSL_KEY_PATH,
			HTTPS_PFX_FILE_PATH,
			HTTPS_PFX_PASSPHRASE,
			LOG_LEVEL,
			KC_ENABLED,
			OBFUSCATION_KEY_NAME,
			OBFUSCATION_KEY_VALUE,
			OBFUSCATION_QUERYSTRING_KEY_ARRAY,
		});

		await expect(getConfig()).rejects.toThrow();
	});
});
