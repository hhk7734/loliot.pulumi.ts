import * as kubernetes from '@pulumi/kubernetes';
import * as networking from '@crds/istio/networking';

const tolerations = [
	{
		key: 'node-role.kubernetes.io/master',
		operator: 'Exists',
		effect: 'NoSchedule'
	}
];

const deployment = new kubernetes.apps.v1.Deployment('wiki', {
	metadata: {
		name: 'wiki',
		labels: {
			'loliot.net/stack': 'wiki'
		}
	},
	spec: {
		revisionHistoryLimit: 3,
		selector: {
			matchLabels: {
				'app.kubernetes.io/name': 'wiki',
				app: 'wiki'
			}
		},
		template: {
			metadata: {
				labels: {
					'app.kubernetes.io/name': 'wiki',
					app: 'wiki'
				}
			},
			spec: {
				containers: [
					{
						name: 'wiki',
						image: 'ghcr.io/hhk7734/wiki:e182cca2',
						imagePullPolicy: 'Always',
						ports: [
							{
								name: 'http',
								containerPort: 80,
								protocol: 'TCP'
							}
						],
						resources: {
							requests: {
								memory: '10Mi'
							},
							limits: {
								memory: '64Mi'
							}
						}
					}
				],
				tolerations: tolerations,
				imagePullSecrets: [
					{
						name: 'hhk7734-ghcr'
					}
				]
			}
		}
	}
});

const service = new kubernetes.core.v1.Service('wiki', {
	metadata: {
		name: 'wiki',
		labels: {
			'loliot.net/stack': 'wiki'
		}
	},
	spec: {
		ports: [
			{
				name: 'http',
				port: 8080,
				protocol: 'TCP',
				targetPort: 80
			}
		],
		selector: deployment.spec.selector.matchLabels,
		type: 'ClusterIP'
	}
});

const virtualService = new networking.v1beta1.VirtualService('wiki', {
	metadata: {
		name: 'wiki'
	},
	spec: {
		hosts: ['wiki.loliot.net', 'loliot.net'],
		gateways: ['istio-system/default-gateway'],
		http: [
			{
				match: [
					{
						authority: {
							exact: 'loliot.net'
						}
					}
				],
				redirect: {
					authority: 'wiki.loliot.net'
				}
			},
			{
				match: [
					{
						uri: {
							prefix: '/'
						}
					}
				],
				route: [
					{
						destination: {
							host: 'wiki',
							port: {
								number: 8080
							}
						}
					}
				]
			}
		]
	}
});
