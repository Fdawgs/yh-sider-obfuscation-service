"use strict";

const S = require("fluent-json-schema").default;

const tags = ["Redirects"];

/**
 * Fastify uses AJV for JSON Schema Validation.
 * Input validation protects against XSS, HPP, prototype pollution,
 * and most other injection attacks.
 * @see {@link https://fastify.io/docs/latest/Reference/Validation-and-Serialization | Fastify Validation and Serialization}
 */
const redirectGetSchema = {
	tags,
	summary: "Redirect to SIDeR",
	description:
		"Redirects to the URL set with the `REDIRECT_URL` environment variable.",
	operationId: "getRedirect",
	produces: ["application/json", "application/xml"],
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
				.pattern(/^https:\/\/fhir\.nhs\.uk\/Id\/nhs-number\|\d{10}$/u)
		)
		.prop(
			"location",
			S.string()
				.description(
					"The Identifier of the organisation or site of the practitioner launching the app"
				)
				.examples(["https://fhir.nhs.uk/Id/ods-organization-code|RH5"])
				.pattern(
					/^https:\/\/fhir\.nhs\.uk\/Id\/ods-organization-code\|[\dA-Za-z]{1,9}$/u
				)
		)
		.prop(
			"practitioner",
			S.string()
				.description(
					"The Identifier of the practitioner launching the app"
				)
				.examples([
					"https://sider.nhs.uk/auth|frazer.smith@somersetft.nhs.uk",
				])
				/** @see {@link https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address | Valid email address pattern} */
				.pattern(
					// eslint-disable-next-line security/detect-unsafe-regex -- False positive
					/^https:\/\/sider\.nhs\.uk\/auth\|[\w!#$%&'*+\-./=?^`{|}~]+@[\dA-Za-z](?:[\d\-A-Za-z]{0,61}[\dA-Za-z])?(?:\.[\dA-Za-z](?:[\d\-A-Za-z]{0,61}[\dA-Za-z])?)*$/u
				)
		)
		.required(["birthdate", "patient", "location", "practitioner"]),
	response: {
		302: {
			description: "Found",
			content: {
				"text/html": {
					schema: {
						type: "string",
					},
				},
			},
		},
		400: S.ref("responses#/properties/badRequest").description(
			"Bad Request"
		),
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
