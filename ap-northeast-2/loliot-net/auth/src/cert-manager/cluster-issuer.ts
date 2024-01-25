import * as kubernetes from '@pulumi/kubernetes';
import * as certmanager from '@crds/certmanager/certmanager';
import { certManager } from '@src/cert-manager/cert-manager';
import * as variable from '@src/variable';
import { namespace } from '@src/namespace';

const cloudflareAPITokenSecretName = 'cloudflare-api-token';
const cloudflareAPITokenSecret = new kubernetes.core.v1.Secret(cloudflareAPITokenSecretName, {
	metadata: {
		name: cloudflareAPITokenSecretName,
		namespace: namespace.metadata.name,
		labels: {
			'loliot.net/stack': variable.stackName
		}
	},
	type: 'Opaque',
	data: {
		token: variable.cloudflareAPIToken.apply((token) => Buffer.from(token).toString('base64'))
	}
});

const cloudflareLetsencryptName = 'cloudflare-letsencrypt';
new certmanager.v1.ClusterIssuer(
	cloudflareLetsencryptName,
	{
		metadata: {
			name: cloudflareLetsencryptName,
			labels: {
				'loliot.net/stack': variable.stackName
			}
		},
		spec: {
			acme: {
				email: 'hhk7734@gmail.com',
				server: 'https://acme-v02.api.letsencrypt.org/directory',
				privateKeySecretRef: {
					name: cloudflareLetsencryptName
				},
				solvers: [
					{
						selector: {
							dnsZones: ['loliot.net']
						},
						dns01: {
							cloudflare: {
								email: 'hhk7734@gmail.com',
								apiTokenSecretRef: {
									name: cloudflareAPITokenSecret.metadata.name,
									key: 'token'
								}
							}
						}
					}
				]
			}
		}
	},
	{
		dependsOn: [certManager]
	}
);
