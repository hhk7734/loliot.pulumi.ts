import * as kubernetes from '@pulumi/kubernetes';
import * as variable from '@src/variable';
import { namespace } from '@src/namespace';

const hhk7734GHCRName = 'hhk7734-ghcr';
export const hhk7734GHCR = new kubernetes.core.v1.Secret(hhk7734GHCRName, {
	metadata: {
		name: hhk7734GHCRName,
		namespace: namespace.metadata.name,
		labels: {
			'loliot.net/stack': variable.stackName
		}
	},
	type: 'kubernetes.io/dockerconfigjson',
	data: {
		'.dockerconfigjson': variable.githubGHCRKey.apply((key) => Buffer.from(key).toString('base64'))
	}
});
