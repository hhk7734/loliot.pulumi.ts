import * as kubernetes from '@pulumi/kubernetes';
import { namespace } from './namespace';

const istioBaseName = 'istio-base';
export const istioBase = new kubernetes.helm.v3.Release(istioBaseName, {
	name: istioBaseName,
	repositoryOpts: {
		repo: 'https://istio-release.storage.googleapis.com/charts'
	},
	chart: 'base',
	version: '1.18.2',
	namespace: namespace.metadata.name,
	maxHistory: 3,
	values: {
		defaultRevision: '1-18-2'
	}
});
