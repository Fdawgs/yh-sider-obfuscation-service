/**
 * Refer to option documentation here:
 * https://github.com/keycloak/keycloak-documentation/blob/master/securing_apps/topics/token-exchange/token-exchange.adoc
 */
const keycloakRetrieveConfig = {
	enabled: 'true',
	requestToken: {
		form: {
			audience: 'mock-audience',
			client_id: 'mock-id',
			client_secret: 'mock-secret',
			grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
			requested_token_type:
				'urn:ietf:params:oauth:token-type:access_token'
		},
		url: 'http://127.0.0.1:3000/token'
	},
	serviceAuthorisation: {
		form: {
			client_id: 'mock-id',
			client_secret: 'mock-secret',
			grant_type: 'password',
			password: 'mock-password',
			username: 'mock-user@ydh.nhs.uk'
		},
		url: 'http://127.0.0.1:3000/token'
	}
};

module.exports = {
	keycloakRetrieveConfig
};
