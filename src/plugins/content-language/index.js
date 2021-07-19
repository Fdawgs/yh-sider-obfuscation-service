const { NotAcceptable } = require("http-errors");
const fp = require("fastify-plugin");

/**
 * @author Frazer Smith
 * @description On-Request plugin to set the `Content-Language`
 * response header and parse the `Accept-Language` request header.
 * @param {Function} server - Fastify instance.
 * @param {object} options - Plugin config values.
 * @param {Array} options.contentLanguages - Language(s) supported.
 */
async function plugin(server, options) {
	server.addHook("onRequest", async (req, res) => {
		res.headers({
			"Content-Language": options.contentLanguages.join(", "),
		});

		if (
			// Catch unsupported Accept header media types
			!options.contentLanguages.includes(
				req.accepts().language(options.contentLanguages)
			)
		) {
			res.send(NotAcceptable());
		}
	});
}

module.exports = fp(plugin, {
	fastify: "3.x",
	name: "content-language",
	dependencies: ["fastify-accepts"],
});
