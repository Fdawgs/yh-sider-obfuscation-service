/* eslint-disable security/detect-non-literal-fs-filename */
require("dotenv").config();

const envSchema = require("env-schema");
const S = require("fluent-json-schema");
const fsp = require("fs").promises;
const pino = require("pino");
const rotatingLogStream = require("file-stream-rotator");

const { name, description, license, version } = require("../../package.json");

/**
 * @author Frazer Smith
 * @description Convert string boolean to boolean
 * or comma-delimited string to array.
 * @param {string} param - CORS parameter.
 * @returns {boolean|Array|string} CORS parameter.
 */
function parseCorsParameter(param) {
	if (param.trim() === "true") {
		return true;
	}
	if (param.trim() === "false") {
		return false;
	}
	if (param.includes(",")) {
		const paramArray = [];
		param
			.trim()
			.split(",")
			.forEach((value) => {
				paramArray.push(value.trim());
			});

		return paramArray;
	}
	return param;
}

/**
 * @author Frazer Smith
 * @description Validate environment variables and build server config.
 * @returns {object} Server config.
 */
async function getConfig() {
	// Validate env variables
	const env = envSchema({
		dotenv: true,
		schema: S.object()
			.prop("NODE_ENV", S.string())

			// Service
			.prop("SERVICE_HOST", S.string())
			.prop("SERVICE_PORT", S.number())
			.prop("SERVICE_REDIRECT_URL", S.anyOf([S.string(), S.null()]))

			// CORS
			.prop("CORS_ORIGIN", S.anyOf([S.string(), S.null()]))
			.prop("CORS_ALLOWED_HEADERS", S.anyOf([S.string(), S.null()]))
			.prop(
				"CORS_ALLOW_CREDENTIALS",
				S.anyOf([S.string().enum(["true"]), S.null()])
			)
			.prop("CORS_EXPOSED_HEADERS", S.anyOf([S.string(), S.null()]))

			// HTTPS
			.prop("HTTPS_PFX_PASSPHRASE", S.anyOf([S.string(), S.null()]))
			.prop("HTTPS_PFX_FILE_PATH", S.anyOf([S.string(), S.null()]))
			.prop("HTTPS_SSL_CERT_PATH", S.anyOf([S.string(), S.null()]))
			.prop("HTTPS_SSL_KEY_PATH", S.anyOf([S.string(), S.null()]))

			// Logger
			.prop(
				"LOG_LEVEL",
				S.anyOf([
					S.string()
						.enum([
							"fatal",
							"error",
							"warn",
							"info",
							"debug",
							"trace",
							"silent",
						])
						.default("info"),
					S.null(),
				])
			)
			.prop(
				"LOG_ROTATION_DATE_FORMAT",
				S.anyOf([S.string().default("YYYY-MM-DD"), S.null()])
			)
			.prop("LOG_ROTATION_FILENAME", S.anyOf([S.string(), S.null()]))
			.prop(
				"LOG_ROTATION_FREQUENCY",
				S.anyOf([
					S.string()
						.enum(["custom", "daily", "test"])
						.default("daily"),
					S.null(),
				])
			)
			.prop("LOG_ROTATION_MAX_LOGS", S.anyOf([S.string(), S.null()]))
			.prop("LOG_ROTATION_MAX_SIZE", S.anyOf([S.string(), S.null()]))

			// Process Load Handling
			.prop(
				"PROC_LOAD_MAX_EVENT_LOOP_DELAY",
				S.anyOf([S.number().default(0), S.null()])
			)
			.prop(
				"PROC_LOAD_MAX_EVENT_LOOP_UTILIZATION",
				S.anyOf([S.number().default(0), S.null()])
			)
			.prop(
				"PROC_LOAD_MAX_HEAP_USED_BYTES",
				S.anyOf([S.number().default(0), S.null()])
			)
			.prop(
				"PROC_LOAD_MAX_RSS_BYTES",
				S.anyOf([S.number().default(0), S.null()])
			)

			// Rate Limiting
			.prop("RATE_LIMIT_EXCLUDED_ARRAY", S.anyOf([S.string(), S.null()]))
			.prop(
				"RATE_LIMIT_MAX_CONNECTIONS_PER_MIN",
				S.anyOf([S.number().default(1000), S.null()])
			)

			// Keycloak
			.prop("KC_ENABLED", S.anyOf([S.boolean().default(false), S.null()]))
			.prop("KC_REQUESTTOKEN_URL", S.anyOf([S.string(), S.null()]))
			.prop("KC_REQUESTTOKEN_AUDIENCE", S.anyOf([S.string(), S.null()]))
			.prop("KC_REQUESTTOKEN_CLIENT_ID", S.anyOf([S.string(), S.null()]))
			.prop(
				"KC_REQUESTTOKEN_CLIENT_SECRET",
				S.anyOf([S.string(), S.null()])
			)
			.prop("KC_REQUESTTOKEN_GRANT_TYPE", S.anyOf([S.string(), S.null()]))
			.prop(
				"KC_REQUESTTOKEN_REQUESTED_TOKEN_TYPE",
				S.anyOf([S.string(), S.null()])
			)
			.prop("KC_SERVICEAUTH_URL", S.anyOf([S.string(), S.null()]))
			.prop("KC_SERVICEAUTH_CLIENT_ID", S.anyOf([S.string(), S.null()]))
			.prop(
				"KC_SERVICEAUTH_CLIENT_SECRET",
				S.anyOf([S.string(), S.null()])
			)
			.prop("KC_SERVICEAUTH_GRANT_TYPE", S.anyOf([S.string(), S.null()]))
			.prop("KC_SERVICEAUTH_PASSWORD", S.anyOf([S.string(), S.null()]))
			.prop("KC_SERVICEAUTH_USERNAME", S.anyOf([S.string(), S.null()]))

			// Obfuscation
			.prop("OBFUSCATION_KEY_NAME", S.string())
			.prop("OBFUSCATION_KEY_VALUE", S.string())
			.prop("OBFUSCATION_QUERYSTRING_KEY_ARRAY", S.string())
			.required(["NODE_ENV", "SERVICE_HOST", "SERVICE_PORT"]),
	});

	const isProduction = env.NODE_ENV.toLowerCase() === "production";

	const config = {
		isProduction,
		fastify: {
			host: env.SERVICE_HOST,
			port: env.SERVICE_PORT,
		},
		fastifyInit: {
			/**
			 * See https://www.fastify.io/docs/v3.8.x/Logging/
			 * and https://getpino.io/#/docs/api for logger options
			 */
			logger: {
				formatters: {
					level(label) {
						return { level: label };
					},
				},
				level: env.LOG_LEVEL || "info",
				/**
				 * Pretty output to stdout out if not in production.
				 * Replaces using `pino-pretty` in scripts, as it does not play
				 * well with Nodemon
				 */
				prettyPrint:
					env.NODE_ENV.toLowerCase() !== "production" &&
					(!env.LOG_ROTATION_FILENAME ||
						env.LOG_ROTATION_FILENAME === ""),
				serializers: {
					/* istanbul ignore next */
					req(req) {
						return pino.stdSerializers.req(req);
					},
					/* istanbul ignore next */
					res(res) {
						return pino.stdSerializers.res(res);
					},
				},
				timestamp: () => pino.stdTimeFunctions.isoTime(),
			},
			ignoreTrailingSlash: true,
		},
		cors: {
			origin: parseCorsParameter(env.CORS_ORIGIN) || false,
		},
		processLoad: {
			maxEventLoopDelay: env.PROC_LOAD_MAX_EVENT_LOOP_DELAY || 0,
			maxEventLoopUtilization:
				env.PROC_LOAD_MAX_EVENT_LOOP_UTILIZATION || 0,
			maxHeapUsedBytes: env.PROC_LOAD_MAX_HEAP_USED_BYTES || 0,
			maxRssBytes: env.PROC_LOAD_MAX_RSS_BYTES || 0,
		},
		rateLimit: {
			max: env.RATE_LIMIT_MAX_CONNECTIONS_PER_MIN || 1000,
			timeWindow: 60000,
		},
		swagger: {
			routePrefix: "/docs",
			exposeRoute: true,
			staticCSP: true,
			openapi: {
				info: {
					title: name,
					description,
					contact: {
						name: "Solutions Development Team",
						email: "servicedesk@ydh.nhs.uk",
					},
					license: {
						name: license,
						url: "https://raw.githubusercontent.com/Fdawgs/ydh-sider-obfuscation-service/master/LICENSE",
					},
					version,
				},
				tags: [
					{
						name: "Redirects",
						description:
							"Endpoints relating to redirection to SIDeR",
					},
					{
						name: "System Administration",
						description: "",
					},
				],
			},
		},
		redirectUrl: env.SERVICE_REDIRECT_URL,
		// Values used by keycloak-access-token plugin in wildcard service
		keycloak: {
			enabled: env.KC_ENABLED || false,
			// Request access token for user
			requestToken: {
				form: {
					audience: env.KC_REQUESTTOKEN_AUDIENCE,
					client_id: env.KC_REQUESTTOKEN_CLIENT_ID,
					client_secret: env.KC_REQUESTTOKEN_CLIENT_SECRET,
					grant_type: env.KC_REQUESTTOKEN_GRANT_TYPE,
					requested_subject: undefined,
					requested_token_type:
						env.KC_REQUESTTOKEN_REQUESTED_TOKEN_TYPE,
				},
				url: env.KC_REQUESTTOKEN_URL,
			},
			// Service authorisation to retrieve subject access token
			serviceAuthorisation: {
				form: {
					client_id: env.KC_SERVICEAUTH_CLIENT_ID,
					client_secret: env.KC_SERVICEAUTH_CLIENT_SECRET,
					grant_type: env.KC_SERVICEAUTH_GRANT_TYPE,
					password: env.KC_SERVICEAUTH_PASSWORD,
					username: env.KC_SERVICEAUTH_USERNAME,
				},
				url: env.KC_SERVICEAUTH_URL,
			},
		},
		// Values used by obfuscate-query-string plugin
		obfuscation: {
			encryptionKey: {
				name: env.OBFUSCATION_KEY_NAME,
				value: env.OBFUSCATION_KEY_VALUE,
			},
			obfuscate: JSON.parse(env.OBFUSCATION_QUERYSTRING_KEY_ARRAY),
		},
	};

	if (env.LOG_ROTATION_FILENAME) {
		// Rotation options: https://github.com/rogerc/file-stream-rotator/#options
		config.fastifyInit.logger.stream = rotatingLogStream.getStream({
			date_format: env.LOG_ROTATION_DATE_FORMAT || "YYYY-MM-DD",
			filename: env.LOG_ROTATION_FILENAME,
			frequency: env.LOG_ROTATION_FREQUENCY || "daily",
			max_logs: env.LOG_ROTATION_MAX_LOG,
			size: env.LOG_ROTATION_MAX_SIZE,
			verbose: false,
		});
	}

	if (env.RATE_LIMIT_EXCLUDED_ARRAY) {
		config.rateLimit.allowList = JSON.parse(env.RATE_LIMIT_EXCLUDED_ARRAY);
	}

	if (String(env.CORS_ALLOW_CREDENTIALS) === "true") {
		config.cors.credentials = true;
	}
	if (env.CORS_ALLOWED_HEADERS) {
		config.cors.allowedHeaders = env.CORS_ALLOWED_HEADERS;
	}
	if (env.CORS_EXPOSED_HEADERS) {
		config.cors.exposedHeaders = env.CORS_EXPOSED_HEADERS;
	}

	// Enable HTTPS using cert/key or passphrase/pfx combinations
	if (env.HTTPS_SSL_CERT_PATH && env.HTTPS_SSL_KEY_PATH) {
		try {
			config.fastifyInit.https = {
				cert: await fsp.readFile(env.HTTPS_SSL_CERT_PATH),
				key: await fsp.readFile(env.HTTPS_SSL_KEY_PATH),
			};
		} catch (err) {
			throw Error(
				`No such file or directory ${err.path} for SSL cert/key, falling back to HTTP`
			);
		}
	}

	if (env.HTTPS_PFX_PASSPHRASE && env.HTTPS_PFX_FILE_PATH) {
		try {
			config.fastifyInit.https = {
				passphrase: env.HTTPS_PFX_PASSPHRASE,
				pfx: await fsp.readFile(env.HTTPS_PFX_FILE_PATH),
			};
		} catch (err) {
			throw Error(
				`No such file or directory ${err.path} for PFX file, falling back to HTTP`
			);
		}
	}

	return config;
}

module.exports = getConfig;
