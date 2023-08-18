import * as kubernetes from "@pulumi/kubernetes";
import { namespace } from "@src/namespace";
import * as variable from "@src/variable";

const certManagerName = "cert-manager";
const certManager = new kubernetes.helm.v3.Release(certManagerName, {
	name: certManagerName,
	repositoryOpts: {
		repo: "https://charts.jetstack.io",
	},
	chart: "cert-manager",
	version: "v1.12.3",
	namespace: namespace.metadata.name,
	maxHistory: 3,
	values: {
		global: {
			commonLabels: {
				"loliot.net/stack": variable.stackName,
			},
		},
		installCRDs: true,
		enableCertificateOwnerRef: true,
		resources: {
			requests: {
				cpu: "10m",
				memory: "32Mi",
			},
		},
	},
});
