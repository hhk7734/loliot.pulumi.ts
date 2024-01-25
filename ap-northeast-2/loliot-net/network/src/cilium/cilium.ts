import * as kubernetes from '@pulumi/kubernetes';
import * as variable from '@src/variable';
import * as yaml from 'js-yaml';

const ciliumName = 'cilium';
export const cilium = new kubernetes.helm.v3.Release(ciliumName, {
	name: ciliumName,
	repositoryOpts: {
		repo: 'https://helm.cilium.io/'
	},
	chart: 'cilium',
	version: '1.14.6',
	namespace: 'kube-system',
	maxHistory: 3,
	values: {
		k8sServiceHost: variable.k8sServiceHost,
		k8sServicePort: '6443',
		cluster: {
			name: variable.clusterName
		},
		bgp: {
			enabled: false,
			announce: {
				loadbalancerIP: true,
				podCIDR: false
			}
		},
		bgpControlPlane: {
			enabled: true
		},
		ipam: {
			mode: 'cluster-pool',
			operator: {
				clusterPoolIPv4PodCIDRList: ['10.244.0.0/16'],
				clusterPoolIPv4MaskSize: 25
			}
		},
		kubeProxyReplacement: 'true',
		operator: {
			replicas: 1
		}
	}
});

const loadbalancerIPPoolName = 'cilium-loadbalancer-ip-pool';
new kubernetes.yaml.ConfigGroup(
	loadbalancerIPPoolName,
	{
		yaml: yaml.dump({
			apiVersion: 'cilium.io/v2alpha1',
			kind: 'CiliumLoadBalancerIPPool',
			metadata: {
				name: loadbalancerIPPoolName,
				labels: {
					'loliot.net/stack': variable.stackName
				}
			},
			spec: {
				cidrs: [
					{
						cidr: '172.26.0.0/20'
					}
				]
			}
		})
	},
	{ dependsOn: [cilium] }
);
