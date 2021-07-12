const S = require("fluent-json-schema");

const tags = ["Redirects"];

/**
 * Fastify uses AJV for JSON Schema Validation,
 * see https://www.fastify.io/docs/latest/Validation-and-Serialization/
 *
 * This validation protects against XSS and HPP attacks.
 */
const redirectGetSchema = {
	tags,
	summary: "Redirect to SIDeR",
	operationId: "getRedirect",
	produces: ["text/html"],
	query: S.object()
		.prop(
			"birthdate",
			S.string()
				.description(
					"The birthdate of the patient in ISO-8601 format (YYYY-MM-DD)"
				)
				.examples(["1900-01-01"])
				.format("date")
				.required()
		)
		.prop(
			"patient",
			S.string()
				.description("The Identifier for the patient")
				.examples(["https://fhir.nhs.uk/Id/nhs-number|9999999999"])
				.pattern(
					"^https:\\/\\/fhir\\.nhs\\.uk\\/Id\\/nhs-number\\|\\d{10}$"
				)
				.required()
		)
		.prop(
			"location",
			S.string()
				.default("https://fhir.nhs.uk/Id/ods-organization-code|RA4")
				.description(
					"The Identifier of the organisation or site of the practitioner launching the app"
				)
				.examples(["https://fhir.nhs.uk/Id/ods-organization-code|RA4"])
				.pattern(
					"^https:\\/\\/fhir\\.nhs\\.uk\\/Id\\/ods-organization-code\\|\\w{1,9}$"
				)
				.required()
		)
		.prop(
			"practitioner",
			S.string()
				.description(
					"The Identifier of the practitioner launching the app"
				)
				.examples(["https://sider.nhs.uk/auth|frazer.smith@ydh.nhs.uk"])
				.pattern(
					'^https:\\/\\/sider\\.nhs\\.uk\\/auth\\|(([^<>()\\[\\]\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\.,;:\\s@"]+)*)|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$'
				)
				.required()
		),

	response: {
		304: S.string().raw({ nullable: true }),
		406: S.object()
			.prop("statusCode", S.number().const(406))
			.prop("error", S.string().const("Not Acceptable"))
			.prop("message", S.string().const("Not Acceptable")),
	},
};

module.exports = { redirectGetSchema };
