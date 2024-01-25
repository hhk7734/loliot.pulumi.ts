import { loadConfig, register } from 'tsconfig-paths';

const tsConfig = loadConfig('.');
if (tsConfig.resultType === 'failed') {
	console.log('Could not load tsconfig to map paths, aborting.');
	process.exit(1);
}
register({
	baseUrl: tsConfig.absoluteBaseUrl,
	paths: tsConfig.paths
});

export * as cilium from './cilium';
export * as istio from './istio';
