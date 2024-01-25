import * as kubernetes from '@pulumi/kubernetes';
import * as variable from '@src/variable';

const namespaceName = 'auth';
export const namespace = new kubernetes.core.v1.Namespace(namespaceName, {
	metadata: {
		name: namespaceName,
		labels: {
			'loliot.net/stack': variable.stackName
		}
	}
});
