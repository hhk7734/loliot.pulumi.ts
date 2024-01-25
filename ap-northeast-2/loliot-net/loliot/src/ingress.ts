import * as networking from '@crds/istio/networking';
import * as kubernetes from '@pulumi/kubernetes';
import * as variable from '@src/variable';
import { namespace } from './namespace';
import * as certmanager from '@crds/certmanager/certmanager';

const ingressName = 'istio-ingress';
const ingress = new kubernetes.helm.v3.Release(ingressName, {
	name: ingressName,
	repositoryOpts: {
		repo: 'https://istio-release.storage.googleapis.com/charts'
	},
	chart: 'gateway',
	version: '1.20.2',
	namespace: namespace.metadata.name,
	maxHistory: 3,
	values: {
		revision: '1-20-2',
		service: {
			ports: [
				{
					name: 'status-port',
					port: 15021,
					targetPort: 15021,
					protocol: 'TCP',
					nodePort: 30104
				},
				{
					name: 'http2',
					port: 80,
					targetPort: 8080,
					protocol: 'TCP',
					nodePort: 30105
				},
				{
					name: 'https',
					port: 443,
					targetPort: 8443,
					protocol: 'TCP',
					nodePort: 30106
				}
			]
		},
		resources: {
			requests: {
				cpu: '10m',
				memory: '64Mi'
			},
			limits: {
				memory: '256Mi'
			}
		},
		autoscaling: {
			enabled: false
		},
		labels: {
			'loliot.net/stack': variable.stackName
		},
		annotations: {
			'io.cilium/lb-ipam-ips': '172.26.15.5'
		},
		tolerations: [
			{
				key: 'node-role.kubernetes.io/master',
				operator: 'Exists',
				effect: 'NoSchedule'
			}
		],
		affinity: {
			nodeAffinity: {
				requiredDuringSchedulingIgnoredDuringExecution: {
					nodeSelectorTerms: [
						{
							matchExpressions: [
								{
									key: 'node-role.kubernetes.io/control-plane',
									operator: 'In',
									values: ['true']
								}
							]
						}
					]
				}
			}
		}
	}
});

const issuerName = variable.auth.certManager
	.apply((certManager) => certManager.clusterIssuer.cloudflareLetsencrypt.metadata)
	.apply((metadata) => `${metadata?.name}`);
const loliotNetIngressCertName = 'loliot-net-ingress-cert';
const loliotNetIngressCert = new certmanager.v1.Certificate(loliotNetIngressCertName, {
	metadata: {
		name: loliotNetIngressCertName,
		namespace: namespace.metadata.name,
		labels: {
			'loliot.net/stack': variable.stackName
		}
	},
	spec: {
		secretName: loliotNetIngressCertName,
		duration: '2160h',
		renewBefore: '360h',
		dnsNames: ['*.loliot.net', 'loliot.net'],
		issuerRef: {
			kind: 'ClusterIssuer',
			name: issuerName
		}
	}
});

const gatewayName = 'gateway';
export const gateway = new networking.v1alpha3.Gateway(
	gatewayName,
	{
		metadata: {
			name: gatewayName,
			namespace: namespace.metadata.name,
			labels: {
				'loliot.net/stack': variable.stackName
			}
		},
		spec: {
			selector: {
				app: ingressName
			},
			servers: [
				{
					port: { number: 80, name: 'http', protocol: 'HTTP' },
					hosts: ['*'],
					tls: { httpsRedirect: true }
				},
				{
					port: { number: 443, name: 'https', protocol: 'HTTPS' },
					hosts: ['*.loliot.net', 'loliot.net'],
					tls: {
						mode: 'SIMPLE',
						credentialName: loliotNetIngressCert.metadata.apply((metadata) => `${metadata?.name}`)
					}
				}
			]
		}
	},
	{
		dependsOn: [ingress]
	}
);
