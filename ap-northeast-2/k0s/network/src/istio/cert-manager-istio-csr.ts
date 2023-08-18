import * as certmanager from "@crds/certmanager/certmanager";
import * as kubernetes from "@pulumi/kubernetes";
import * as variable from "@src/variable";
import { namespace } from "./namespace";

const issuerName = "istio-ca";
const issuer = new certmanager.v1.Issuer(issuerName, {
	metadata: {
		name: issuerName,
		namespace: namespace.metadata.name,
	},
	spec: {
		ca: {
			secretName: "istio-ca",
		},
	},
});

const certManagerIstioCSRName = "cert-manager-istio-csr";
const certManagerIstioCSR = new kubernetes.helm.v3.Release(
	certManagerIstioCSRName,
	{
		name: certManagerIstioCSRName,
		repositoryOpts: {
			repo: "https://charts.jetstack.io",
		},
		chart: "cert-manager-istio-csr",
		version: "v0.7.0",
		namespace: "auth",
		maxHistory: 3,
		values: {
			app: {
				certmanager: {
					issuer: {
						name: issuerName,
					},
				},
				tls: {
					rootCAFile: "/var/run/secrets/istio-csr/ca.pem",
					certificateDNSNames: ["cert-manager-istio-csr.auth.svc"],
					certificateDuration: "24h",
					istiodCertificateDuration: "24h",
				},
				server: {
					clusterID: variable.istioClusterName,
					maxCertificateDuration: "48h",
				},
				istio: {
					revisions: ["1-18-2"],
				},
			},
			volumes: [
				{
					name: "root-ca",
					secret: {
						secretName: "istio-root-ca",
					},
				},
			],
			volumeMounts: [
				{
					name: "root-ca",
					mountPath: "/var/run/secrets/istio-csr",
					readOnly: true,
				},
			],
		},
	},
	{
		dependsOn: [issuer],
	},
);
