import * as kubernetes from '@pulumi/kubernetes';
import { namespace } from '@src/namespace';
import * as variable from '@src/variable';

const tolerations = [
	{
		key: 'node-role.kubernetes.io/master',
		operator: 'Exists',
		effect: 'NoSchedule'
	}
];

const affinity = {
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
};

const certManagerName = 'cert-manager';
export const certManager = new kubernetes.helm.v3.Release(certManagerName, {
	name: certManagerName,
	repositoryOpts: {
		repo: 'https://charts.jetstack.io'
	},
	chart: 'cert-manager',
	version: 'v1.13.3',
	namespace: namespace.metadata.name,
	maxHistory: 3,
	values: {
		global: {
			commonLabels: {
				'loliot.net/stack': variable.stackName
			}
		},
		installCRDs: true,
		enableCertificateOwnerRef: true,
		resources: {
			requests: {
				cpu: '10m',
				memory: '32Mi'
			}
		},
		tolerations: tolerations,
		affinity: affinity,
		webhook: {
			tolerations: tolerations,
			affinity: affinity
		},
		cainjector: {
			tolerations: tolerations,
			affinity: affinity
		},
		startupapicheck: {
			tolerations: tolerations,
			affinity: affinity
		}
	}
});
