import * as certmanager from "@crds/certmanager/certmanager";
import * as variable from "@src/variable";

const cloudflareLetsencryptName = "cloudflare-letsencrypt";
const cloudflareLetsencrypt = new certmanager.v1.ClusterIssuer(
	cloudflareLetsencryptName,
	{
		metadata: {
			name: cloudflareLetsencryptName,
			labels: {
				"loliot.net/stack": variable.stackName,
			},
		},
		spec: {
			acme: {
				email: "hhk7734@gmail.com",
				server: "https://acme-v02.api.letsencrypt.org/directory",
				privateKeySecretRef: {
					name: cloudflareLetsencryptName,
				},
				solvers: [
					{
						selector: {
							dnsZones: ["loliot.net"],
						},
						dns01: {
							cloudflare: {
								email: "hhk7734@gmail.com",
								apiTokenSecretRef: {
									name: "cloudflare-api-token-letsencrypt",
									key: "token",
								},
							},
						},
					},
				],
			},
		},
	},
);
