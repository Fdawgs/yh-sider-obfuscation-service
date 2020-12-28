const Fastify = require("fastify");

const mockServer = Fastify();

mockServer.get("/esp/#!/launch", (req, res) => {
	res.headers({
		"accept-ranges": "bytes",
		"cache-control": "no-cache",
		server: "Microsoft-IIS/10.0",
		"x-powered-by": "ASP.NET",
	});

	res.send("Hi");
});

module.exports = mockServer;
