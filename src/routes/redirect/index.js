const autoLoad = require("fastify-autoload");
const fastifyPlugin = require("fastify-plugin");
const path = require("path");
const createError = require("http-errors");
const queryString = require("querystring");

/**
 * @author Frazer Smith
 * @description Sets routing options for server.
 * @param {Function} server - Fastify instance.
 * @param {object} options - Object containing route config objects.
 */
async function routes(server, options) {
	server.register(autoLoad, {
		dir: path.join(__dirname, "../../plugins"),
		options,
	});

	/**
	 * Fastify uses AJV for JSON Schema Validation,
	 * see https://www.fastify.io/docs/latest/Validation-and-Serialization/
	 *
	 * This validation protects against XSS and HPP attacks.
	 */
	const schema = {
		querystring: {
			type: "object",
			properties: {
				birthdate: { type: "string", format: "date" },
				patient: {
					type: "string",
					pattern:
						"^https:\\/\\/fhir\\.nhs\\.uk\\/Id\\/nhs-number\\|\\d{10}$",
				},
				location: {
					type: "string",
					pattern:
						"^https:\\/\\/fhir\\.nhs\\.uk\\/Id\\/ods-organization-code\\|\\w*$",
				},
				practitioner: {
					type: "string",
					// RFC 5322 compliant email regex
					pattern:
						'^https:\\/\\/sider\\.nhs\\.uk\\/auth\\|(([^<>()\\[\\]\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\.,;:\\s@"]+)*)|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$',
				},
			},
			required: ["patient", "birthdate", "location", "practitioner"],
		},
	};

	server.get("/redirect", { schema }, async (req, res) => {
		if (!options.redirectUrl) {
			res.send(createError(500, "Recieving endpoint missing"));
		}

		const espUrl = options.redirectUrl + queryString.stringify(req.query);
		server.log.debug(espUrl);
		res.redirect(espUrl);
	});
}

module.exports = fastifyPlugin(routes);
