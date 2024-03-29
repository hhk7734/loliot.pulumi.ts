import * as kubernetes from '@pulumi/kubernetes';
import * as variable from '@src/variable';
import { namespace } from './namespace';
import { istioBase } from '@src/istio/istio-base';
import { certManagerIstioCSR } from '@src/istio/cert-manager-istio-csr';

const istiodName = 'istiod-1-20-2';
new kubernetes.helm.v3.Release(
	istiodName,
	{
		name: istiodName,
		repositoryOpts: {
			repo: 'https://istio-release.storage.googleapis.com/charts'
		},
		chart: 'istiod',
		version: '1.20.2',
		namespace: namespace.metadata.name,
		maxHistory: 3,
		values: {
			revision: '1-20-2',
			pilot: {
				autoscaleEnabled: false,
				env: {
					ENABLE_CA_SERVER: 'false'
				},
				resources: {
					requests: {
						cpu: '10m',
						memory: '64Mi'
					}
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
			},
			meshConfig: {
				enablePrometheusMerge: true
			},
			global: {
				caAddress: 'cert-manager-istio-csr.auth.svc:443',
				certSigners: ['issuers.cert-manager.io/istio-ca'],
				meshID: 'mesh-1',
				multiCluster: {
					enabled: true,
					clusterName: variable.clusterName
				},
				network: variable.istioNetwork
			}
		}
	},
	{
		dependsOn: [istioBase, certManagerIstioCSR]
	}
);
