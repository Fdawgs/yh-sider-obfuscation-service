const Fastify = require("fastify");
// eslint-disable-next-line import/no-extraneous-dependencies
const fastifyFormBody = require("@fastify/formbody");

const mockServer = Fastify();

mockServer.register(fastifyFormBody);

mockServer.post("/token", (req, res) => {
	res.headers({
		"cache-control": "no-store",
		connection: "keep-alive",
		pragma: "no-cache",
		"content-type": "application/json",
	});

	// Mock user token request return
	if (req.params.audience === "mock-audience") {
		res.send({
			access_token: "mock-access-token",
			expires_in: 900,
			refresh_expires_in: 0,
			token_type: "bearer",
			"not-before-policy": 0,
			session_state: "mock-session-state",
			scope: "profile email",
		});
	}

	// Mock service authorisation return
	res.send({
		access_token: "mock-access-token-authorised",
		expires_in: 900,
		refresh_expires_in: 1000,
		refresh_token: "mock-refresh-token",
		token_type: "bearer",
		"not-before-policy": 0,
		session_state: "mock-session-state",
		scope: "profile email",
	});
});

module.exports = mockServer;
