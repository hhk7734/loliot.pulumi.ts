import * as kubernetes from "@pulumi/kubernetes";
import * as variable from "@src/variable";
import { namespace } from "./namespace";

const istiodName = "istiod-1-18-2";
const istiod = new kubernetes.helm.v3.Release(istiodName, {
	name: istiodName,
	repositoryOpts: {
		repo: "https://istio-release.storage.googleapis.com/charts",
	},
	chart: "istiod",
	version: "1.18.2",
	namespace: namespace.metadata.name,
	maxHistory: 3,
	values: {
		revision: "1-18-2",
		pilot: {
			env: {
				ENABLE_CA_SERVER: "false",
			},
			resources: {
				requests: {
					cpu: "10m",
					memory: "64Mi",
				},
			},
		},
		meshConfig: {
			enablePrometheusMerge: true,
		},
		global: {
			caAddress: "cert-manager-istio-csr.auth.svc:443",
			certSigners: ["issuers.cert-manager.io/istio-ca"],
			meshID: "mesh-1",
			multiCluster: {
				enabled: true,
				clusterName: variable.istioClusterName,
			},
			network: variable.istioNetwork,
		},
	},
});
