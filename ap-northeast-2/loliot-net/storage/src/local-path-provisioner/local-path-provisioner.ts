import { namespace } from '@src/namespace';
import * as kubernetes from '@pulumi/kubernetes';
import * as path from 'path';

const localPathProvisionerName = 'local-path-provisioner';
new kubernetes.helm.v3.Release(localPathProvisionerName, {
	name: localPathProvisionerName,
	chart: path.join(__dirname, '../../../../../charts/local-path-provisioner-0.0.25.tgz'),
	namespace: namespace.metadata.name,
	maxHistory: 3,
	values: {
		storageClass: {
			defaultClass: true
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
