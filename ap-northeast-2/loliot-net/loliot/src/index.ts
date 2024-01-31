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
import * as ghcr from './ghcr';
import * as wiki from './wiki';
import * as ingress from './ingress';

namespace;
ghcr;
wiki;
ingress;
