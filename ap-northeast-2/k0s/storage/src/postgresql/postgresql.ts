import * as kubernetes from '@pulumi/kubernetes';
import * as variable from '@src/variable';
import { namespace } from '@src/namespace';

const matchLabels = {
	'app.kubernetes.io/name': 'postgresql',
	app: 'postgresql'
};
const labels = {
	'loliot.net/stack': variable.stackName,
	...matchLabels
};

const secretName = 'postgresql';
const secret = new kubernetes.core.v1.Secret(secretName, {
	metadata: {
		name: secretName,
		namespace: namespace.metadata.name,
		labels: labels
	},
	stringData: {
		password: variable.postgresqlPassword
	}
});

const serviceAccountName = 'postgresql';
const serviceAccount = new kubernetes.core.v1.ServiceAccount(serviceAccountName, {
	metadata: {
		name: serviceAccountName,
		namespace: namespace.metadata.name,
		labels: labels
	}
});

const statefulSetName = 'postgresql';
const statefulSet = new kubernetes.apps.v1.StatefulSet(statefulSetName, {
	metadata: {
		name: statefulSetName,
		namespace: namespace.metadata.name,
		labels: labels
	},
	spec: {
		serviceName: 'postgresql',
		replicas: 1,
		selector: {
			matchLabels: matchLabels
		},
		template: {
			metadata: {
				labels: labels
			},
			spec: {
				serviceAccountName: serviceAccount.metadata.name,
				containers: [
					{
						name: statefulSetName,
						image: 'postgres:15.4-alpine3.18',
						imagePullPolicy: 'IfNotPresent',
						ports: [
							{
								name: 'postgresql',
								containerPort: 5432,
								protocol: 'TCP'
							}
						],
						env: [
							{
								name: 'POSTGRES_USER',
								value: 'postgres'
							},
							{
								name: 'POSTGRES_PASSWORD',
								valueFrom: {
									secretKeyRef: {
										name: secret.metadata.name,
										key: 'password'
									}
								}
							},
							{
								name: 'PGDATA',
								value: '/var/lib/postgresql/data'
							}
						],
						resources: {
							requests: {
								memory: '10Mi'
							},
							limits: {
								memory: '64Mi'
							}
						},
						volumeMounts: [
							{
								name: 'data',
								mountPath: '/var/lib/postgresql/data'
							},
							{
								name: 'dshm',
								mountPath: '/dev/shm'
							}
						]
					}
				],
				affinity: {
					podAntiAffinity: {
						preferredDuringSchedulingIgnoredDuringExecution: [
							{
								weight: 100,
								podAffinityTerm: {
									topologyKey: 'kubernetes.io/hostname',
									labelSelector: {
										matchLabels: matchLabels
									}
								}
							}
						]
					},
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
				tolerations: [
					{
						key: 'node-role.kubernetes.io/master',
						operator: 'Exists',
						effect: 'NoSchedule'
					}
				],
				volumes: [
					{
						name: 'dshm',
						emptyDir: {
							medium: 'Memory'
						}
					}
				]
			}
		},
		volumeClaimTemplates: [
			{
				metadata: {
					name: 'data',
					labels: labels
				},
				spec: {
					accessModes: ['ReadWriteOnce'],
					resources: {
						requests: {
							storage: '5Gi'
						}
					}
				}
			}
		]
	}
});

const serviceName = 'postgresql';
const service = new kubernetes.core.v1.Service(serviceName, {
	metadata: {
		name: serviceName,
		namespace: namespace.metadata.name,
		labels: labels
	},
	spec: {
		selector: matchLabels,
		ports: [
			{
				name: 'postgresql',
				port: 5432,
				targetPort: 'postgresql',
				protocol: 'TCP'
			}
		]
	}
});
