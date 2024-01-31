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
import * as localPathProvisioner from './local-path-provisioner';
import * as postgresql from './postgresql';

namespace;

export { localPathProvisioner, postgresql };
