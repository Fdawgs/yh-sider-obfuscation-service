const fp = require("fastify-plugin");
const NetMask = require("netmask").Netmask;

/**
 * @author Frazer Smith
 * @description On-Request plugin that checks IP address and subnet mask of request is in allowed list.
 * @param {object} server - Fastify instance.
 * @param {object} options - Plugin config values.
 * @param {object[]} options.ipAddresses - Array or Set of objects containing allowed IP addresses
 * and/or subnet masks.
 * @param {string} options.ipAddresses[].ipAddress - Allowed IP address.
 * @param {string=} options.ipAddresses[].subnetMask - Allowed subnet mask.
 */
async function plugin(server, options) {
	server.addHook("onRequest", async (req) => {
		const ipAddress = req.ip;
		const subnetMask = new NetMask(ipAddress).mask;

		const ips =
			options.ipAddresses instanceof Set
				? Array.from(options.ipAddresses)
				: options.ipAddresses;

		const allowed = ips.some(
			(allowedIpObj) =>
				allowedIpObj.ipAddress === ipAddress &&
				(allowedIpObj?.subnetMask
					? allowedIpObj.subnetMask === subnetMask
					: true)
		);

		if (!allowed) {
			throw server.httpErrors.forbidden(
				"IP address and/or subnet mask not in accepted range"
			);
		}
	});
}

module.exports = fp(plugin, {
	fastify: "4.x",
	name: "allowed-ips",
	dependencies: ["@fastify/sensible"],
});
