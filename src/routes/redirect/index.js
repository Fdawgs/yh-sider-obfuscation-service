const autoLoad = require("fastify-autoload");
const path = require("path");
const createError = require("http-errors");
const queryString = require("querystring");

/**
 * @author Frazer Smith
 * @description Sets routing options for server.
 * @param {Function} server - Fastify instance.
 * @param {object} options - Object containing route config objects.
 */
async function route(server, options) {
	server.register(autoLoad, {
		dir: path.join(__dirname, "plugins"),
		options,
	});

	/**
	 * Fastify uses AJV for JSON Schema Validation,
	 * see https://www.fastify.io/docs/latest/Validation-and-Serialization/
	 *
	 * This validation protects against XSS and HPP attacks.
	 */
	server.route({
		method: "GET",
		url: "/",
		prefixTrailingSlash: "no-slash",
		schema: {
			querystring: {
				type: "object",
				properties: {
					birthdate: {
						description:
							"The birthdate of the patient in ISO-8601 format (YYYY-MM-DD)",
						examples: ["1900-01-01"],
						type: "string",
						format: "date",
					},
					patient: {
						description: "The Identifier for the patient",
						examples: [
							"https://fhir.nhs.uk/Id/nhs-number|9999999999",
						],
						type: "string",
						pattern:
							"^https:\\/\\/fhir\\.nhs\\.uk\\/Id\\/nhs-number\\|\\d{10}$",
					},
					location: {
						description:
							"The Identifier of the organisation or site of the practitioner launching the app",
						default:
							"https://fhir.nhs.uk/Id/ods-organization-code|RA4",
						examples: [
							"https://fhir.nhs.uk/Id/ods-organization-code|RA4",
						],
						type: "string",
						pattern:
							"^https:\\/\\/fhir\\.nhs\\.uk\\/Id\\/ods-organization-code\\|\\w*$",
					},
					practitioner: {
						description:
							"The Identifier of the practitioner launching the app",
						examples: [
							"https://fhir.nhs.uk/Id/ods-organization-code|frazer.smith@ydh.nhs.uk",
						],
						type: "string",
						// RFC 5322 compliant email regex
						pattern:
							'^https:\\/\\/sider\\.nhs\\.uk\\/auth\\|(([^<>()\\[\\]\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\.,;:\\s@"]+)*)|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$',
					},
				},
				required: ["patient", "birthdate", "location", "practitioner"],
			},
		},
		async handler(req, res) {
			if (!options.redirectUrl) {
				res.send(createError(500, "Recieving endpoint missing"));
			}

			const espUrl =
				options.redirectUrl + queryString.stringify(req.query);
			server.log.debug(espUrl);
			res.redirect(espUrl);
		},
	});
}

module.exports = route;
