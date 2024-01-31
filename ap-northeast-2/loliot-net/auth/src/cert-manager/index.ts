import * as certManager_ from './cert-manager';
import * as clusterIssuer from './cluster-issuer';

certManager_;
clusterIssuer;

export const certManager = {
	clusterIssuer: {
		cloudflareLetsencrypt: {
			metadata: {
				name: clusterIssuer.cloudflareLetsencrypt.metadata.apply((metadata) => `${metadata?.name}`)
			}
		}
	}
};
