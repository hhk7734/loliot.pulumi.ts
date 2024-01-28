import { namespace } from '@src/namespace';
import * as kubernetes from '@pulumi/kubernetes';
import * as path from 'path';
import * as variable from '@src/variable';
import { localPathProvisioner } from '@src/local-path-provisioner/local-path-provisioner';

const postgresqlName = 'postgresql';
new kubernetes.helm.v3.Release(
	postgresqlName,
	{
		name: postgresqlName,
		chart: path.join(__dirname, '../../../../../charts/postgresql-13.4.2.tgz'),
		namespace: namespace.metadata.name,
		maxHistory: 3,
		values: {
			commonLabels: {
				'loliot.net/stack': variable.stackName
			},
			global: {
				storageClass: 'local-path'
			},
			primary: {
				resources: {
					requests: {
						cpu: '10m',
						memory: '256Mi'
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
				},
				persistence: {
					size: '5Gi'
				}
			}
		}
	},
	{ dependsOn: [localPathProvisioner] }
);
