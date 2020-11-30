require('custom-env').env();

const fs = require('fs');
const pino = require('pino');
const rotatingLogStream = require('file-stream-rotator');

const fastifyConfig = {
	/**
	 * See https://www.fastify.io/docs/v3.8.x/Logging/
	 * and https://getpino.io/#/docs/api for logger options
	 */
	logger: {
		formatters: {
			level(label) {
				return { level: label };
			}
		},
		// Defaults to `info` if not set in env
		level: process.env.LOGGER_LEVEL,
		serializers: {
			req(req) {
				return pino.stdSerializers.req(req);
			},
			res(res) {
				return pino.stdSerializers.res(res);
			}
		},
		timestamp: () => {
			return pino.stdTimeFunctions.isoTime();
		},
		// Rotation options: https://github.com/rogerc/file-stream-rotator/#options
		stream: rotatingLogStream.getStream({
			date_format:
				process.env.LOGGER_ROTATION_DATE_FORMAT || 'YYYY-MM-DD',
			filename:
				process.env.LOGGER_ROTATION_FILENAME ||
				`${process.cwd()}/logs/obs-service-%DATE%.log`,
			frequency: process.env.LOGGER_ROTATION_FREQUENCY || 'daily',
			max_logs: process.env.LOGGER_ROTATION_MAX_LOG,
			size: process.env.LOGGER_ROTATION_MAX_SIZE,
			verbose: false
		})
	}
};

// Enable HTTPS using cert/key or passphrase/pfx combinations
if (
	fs.existsSync(process.env.HTTPS_SSL_CERT_PATH) &&
	fs.existsSync(process.env.HTTPS_SSL_KEY_PATH)
) {
	fastifyConfig.https = {
		cert: fs.readFileSync(process.env.HTTPS_SSL_CERT_PATH),
		key: fs.readFileSync(process.env.HTTPS_SSL_KEY_PATH)
	};
}

if (
	process.env.HTTPS_PFX_PASSPHRASE &&
	fs.existsSync(process.env.HTTPS_PFX_FILE_PATH)
) {
	fastifyConfig.https = {
		passphrase: process.env.HTTPS_PFX_PASSPHRASE,
		pfx: fs.readFileSync(process.env.HTTPS_PFX_FILE_PATH)
	};
}

const appConfig = {
	redirectUrl: process.env.SERVICE_REDIRECT_URL,

	// Values used by keycloak-access-token plugin in wildcard service
	keycloak: {
		enabled: process.env.KC_ENABLED,
		// Request access token for user
		requestToken: {
			form: {
				audience: process.env.KC_REQUESTTOKEN_AUDIENCE,
				client_id: process.env.KC_REQUESTTOKEN_CLIENT_ID,
				client_secret: process.env.KC_REQUESTTOKEN_CLIENT_SECRET,
				grant_type: process.env.KC_REQUESTTOKEN_GRANT_TYPE,
				requested_subject: undefined,
				requested_token_type:
					process.env.KC_REQUESTTOKEN_REQUESTED_TOKEN_TYPE
			},
			url: process.env.KC_REQUESTTOKEN_URL
		},
		// Service authorisation to retrieve subject access token
		serviceAuthorisation: {
			form: {
				client_id: process.env.KC_SERVICEAUTH_CLIENT_ID,
				client_secret: process.env.KC_SERVICEAUTH_CLIENT_SECRET,
				grant_type: process.env.KC_SERVICEAUTH_GRANT_TYPE,
				password: process.env.KC_SERVICEAUTH_PASSWORD,
				username: process.env.KC_SERVICEAUTH_USERNAME
			},
			url: process.env.KC_SERVICEAUTH_URL
		}
	},
	// Values used by obfuscate-query-string plugin
	obfuscation: {
		encryptionKey: {
			name: process.env.OBFUSCATION_KEY_NAME,
			value: process.env.OBFUSCATION_KEY_VALUE
		},
		obfuscate: JSON.parse(process.env.OBFUSCATION_QUERYSTRING_KEY_ARRAY)
	}
};

module.exports = {
	fastifyConfig,
	appConfig
};
