const S = require("fluent-json-schema");

const tags = ["Redirects"];

/**
 * Fastify uses AJV for JSON Schema Validation,
 * see https://www.fastify.io/docs/latest/Validation-and-Serialization/
 *
 * Input validation protects against XSS, HPP, and most injection attacks.
 */
const redirectGetSchema = {
	tags,
	summary: "Redirect to SIDeR",
	description:
		"Redirects to the URL set with the `SERVICE_REDIRECT_URL` environment variable.",
	operationId: "getRedirect",
	produces: ["text/html"],
	query: S.object()
		.additionalProperties(false)
		.prop(
			"birthdate",
			S.string()
				.description(
					"The birthdate of the patient in ISO-8601 format (YYYY-MM-DD)"
				)
				.examples(["1900-01-01"])
				.format("date")
		)
		.prop(
			"patient",
			S.string()
				.description("The Identifier for the patient")
				.examples(["https://fhir.nhs.uk/Id/nhs-number|9999999999"])
				.pattern(/^https:\/\/fhir\.nhs\.uk\/Id\/nhs-number\|\d{10}$/m)
		)
		.prop(
			"location",
			S.string()
				.description(
					"The Identifier of the organisation or site of the practitioner launching the app"
				)
				.examples(["https://fhir.nhs.uk/Id/ods-organization-code|RA4"])
				.pattern(
					/^https:\/\/fhir\.nhs\.uk\/Id\/ods-organization-code\|[a-zA-Z0-9]{1,9}$/m
				)
		)
		.prop(
			"practitioner",
			S.string()
				.description(
					"The Identifier of the practitioner launching the app"
				)
				.examples(["https://sider.nhs.uk/auth|frazer.smith@ydh.nhs.uk"])
				// See https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address
				.pattern(
					/^https:\/\/sider\.nhs\.uk\/auth\|[\w.!#$%&'*+/=?^`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/m
				)
		)
		.required(["birthdate", "patient", "location", "practitioner"]),

	response: {
		302: S.ref("responses#/properties/found").description("Found"),
		406: S.ref("responses#/properties/notAcceptable").description(
			"Not Acceptable"
		),
		429: S.ref("responses#/properties/tooManyRequests").description(
			"Too Many Requests"
		),
		500: S.ref("responses#/properties/internalServerError").description(
			"Internal Server Error"
		),
		503: S.ref("responses#/properties/serviceUnavailable").description(
			"Service Unavailable"
		),
	},
};

module.exports = { redirectGetSchema };
