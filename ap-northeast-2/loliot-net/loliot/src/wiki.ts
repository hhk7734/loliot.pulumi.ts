import * as kubernetes from '@pulumi/kubernetes';
import * as networking from '@crds/istio/networking';
import { hhk7734GHCR } from '@src/ghcr';
import { namespace } from '@src/namespace';
import * as pulumi from '@pulumi/pulumi';
import { gateway } from '@src/ingress';

const deployment = new kubernetes.apps.v1.Deployment('wiki', {
	metadata: {
		name: 'wiki',
		namespace: namespace.metadata.name,
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
				imagePullSecrets: [
					{
						name: hhk7734GHCR.metadata.name
					}
				],
				containers: [
					{
						name: 'wiki',
						image: 'ghcr.io/hhk7734/wiki:7f898481',
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
		}
	}
});

const service = new kubernetes.core.v1.Service('wiki', {
	metadata: {
		name: 'wiki',
		namespace: namespace.metadata.name,
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

new networking.v1beta1.VirtualService('wiki', {
	metadata: {
		name: 'wiki',
		namespace: namespace.metadata.name
	},
	spec: {
		hosts: ['wiki.loliot.net', 'loliot.net'],
		gateways: [
			gateway.metadata.apply((metadata) =>
				metadata ? `${metadata.namespace}/${metadata.name}` : ''
			)
		],
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
							host: pulumi
								.all([service.metadata.name, service.metadata.namespace])
								.apply(([name, namespace]) => `${name}.${namespace}.svc.cluster.local`),
							port: {
								number: service.spec.ports[0].port
							}
						}
					}
				]
			}
		]
	}
});
