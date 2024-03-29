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

import * as namespace from './namespace';
import { certManager } from './cert-manager';
import { casdoor } from './casdoor';

namespace;

export { certManager, casdoor };
