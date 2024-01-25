import * as kubernetes from '@pulumi/kubernetes';
import * as variable from '@src/variable';
import { cilium } from '@src/cilium/cilium';

const namespaceName = 'istio-system';
export const namespace = new kubernetes.core.v1.Namespace(
	namespaceName,
	{
		metadata: {
			name: namespaceName,
			labels: {
				'loliot.net/stack': variable.stackName,
				'topology.istio.io/network': variable.istioNetwork
			}
		}
	},
	{ dependsOn: [cilium] }
);
