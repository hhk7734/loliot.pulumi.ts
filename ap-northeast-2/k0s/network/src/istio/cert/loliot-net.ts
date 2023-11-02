import * as certmanager from '@crds/certmanager/certmanager';
import { namespace } from '@src/istio/namespace';
import * as variable from '@src/variable';

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
			name: 'cloudflare-letsencrypt'
		}
	}
});
