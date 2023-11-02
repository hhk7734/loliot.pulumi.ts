import * as kubernetes from '@pulumi/kubernetes';
import * as variable from '@src/variable';
import * as metallbCRD from '@crds/metallb/metallb';
import { namespace } from './namespace';

const tolerations = [
	{
		key: 'node-role.kubernetes.io/master',
		operator: 'Exists',
		effect: 'NoSchedule'
	}
];

const metallbName = 'metallb';
const metallb = new kubernetes.helm.v3.Release(metallbName, {
	name: metallbName,
	repositoryOpts: {
		repo: 'https://metallb.github.io/metallb'
	},
	chart: 'metallb',
	version: '0.13.10',
	namespace: namespace.metadata.name,
	maxHistory: 3,
	values: {
		controller: {
			labels: {
				'loliot.net/stack': variable.stackName
			},
			tolerations: tolerations
		},
		speaker: {
			labels: {
				'loliot.net/stack': variable.stackName
			},
			tolerations: tolerations
		}
	}
});

const defaultIpAddressPoolName = 'default';
export const defaultIpAddressPool = new metallbCRD.v1beta1.IPAddressPool(
	defaultIpAddressPoolName,
	{
		metadata: {
			name: defaultIpAddressPoolName,
			namespace: namespace.metadata.name,
			labels: {
				'loliot.net/stack': variable.stackName
			}
		},
		spec: {
			addresses: ['172.26.3.239/32']
		}
	},
	{
		dependsOn: [metallb]
	}
);

const defaultL2AdvertisementName = 'default';
const defaultL2Advertisement = new metallbCRD.v1beta1.L2Advertisement(
	defaultL2AdvertisementName,
	{
		metadata: {
			name: defaultL2AdvertisementName,
			namespace: namespace.metadata.name,
			labels: {
				'loliot.net/stack': variable.stackName
			}
		},
		spec: {
			ipAddressPools: [defaultIpAddressPoolName]
		}
	},
	{
		dependsOn: [defaultIpAddressPool]
	}
);
