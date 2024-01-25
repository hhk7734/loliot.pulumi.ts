import * as certmanager from '@crds/certmanager/certmanager';
import * as kubernetes from '@pulumi/kubernetes';
import * as variable from '@src/variable';
import { namespace } from './namespace';

const istioCASecretName = 'istio-ca';
const istioCASecret = new kubernetes.core.v1.Secret(istioCASecretName, {
	metadata: {
		name: istioCASecretName,
		namespace: namespace.metadata.name,
		labels: {
			'loliot.net/stack': variable.stackName
		}
	},
	type: 'Opaque',
	data: {
		'tls.key': variable.istioCATLSKey.apply((key) => Buffer.from(key).toString('base64')),
		'tls.crt': variable.istioCATLSCert.apply((cert) => Buffer.from(cert).toString('base64'))
	}
});

const issuerName = 'istio-ca';
const issuer = new certmanager.v1.Issuer(issuerName, {
	metadata: {
		name: issuerName,
		namespace: namespace.metadata.name
	},
	spec: {
		ca: {
			secretName: istioCASecret.metadata.name
		}
	}
});

const istioRootCASecretName = 'istio-root-ca';
const istioRootCASecret = new kubernetes.core.v1.Secret(istioRootCASecretName, {
	metadata: {
		name: istioRootCASecretName,
		namespace: 'auth',
		labels: {
			'loliot.net/stack': variable.stackName
		}
	},
	type: 'Opaque',
	data: {
		'ca.pem': variable.istioCATLSCert.apply((cert) => Buffer.from(cert).toString('base64'))
	}
});

const certManagerIstioCSRName = 'cert-manager-istio-csr';
export const certManagerIstioCSR = new kubernetes.helm.v3.Release(
	certManagerIstioCSRName,
	{
		name: certManagerIstioCSRName,
		repositoryOpts: {
			repo: 'https://charts.jetstack.io'
		},
		chart: 'cert-manager-istio-csr',
		version: 'v0.7.1',
		namespace: 'auth',
		maxHistory: 3,
		values: {
			app: {
				certmanager: {
					issuer: {
						name: issuerName
					}
				},
				tls: {
					rootCAFile: '/var/run/secrets/istio-csr/ca.pem',
					certificateDNSNames: ['cert-manager-istio-csr.auth.svc'],
					certificateDuration: '24h',
					istiodCertificateDuration: '24h'
				},
				server: {
					clusterID: variable.clusterName,
					maxCertificateDuration: '48h'
				},
				istio: {
					revisions: ['1-20-2']
				}
			},
			volumes: [
				{
					name: 'root-ca',
					secret: {
						secretName: istioRootCASecret.metadata.name
					}
				}
			],
			volumeMounts: [
				{
					name: 'root-ca',
					mountPath: '/var/run/secrets/istio-csr',
					readOnly: true
				}
			],
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
	},
	{
		dependsOn: [issuer]
	}
);
