import * as networking from "@crds/istio/networking";
import * as kubernetes from "@pulumi/kubernetes";
import * as variable from "@src/variable";
import { namespace } from "./namespace";

const ingressName = "istio-ingress";
const ingress = new kubernetes.helm.v3.Release(ingressName, {
	name: ingressName,
	repositoryOpts: {
		repo: "https://istio-release.storage.googleapis.com/charts",
	},
	chart: "gateway",
	version: "1.18.2",
	namespace: namespace.metadata.name,
	maxHistory: 3,
	values: {
		revision: "1-18-2",
		service: {
			ports: [
				{
					name: "status-port",
					port: 15021,
					targetPort: 15021,
					protocol: "TCP",
					nodePort: 30104,
				},
				{
					name: "http2",
					port: 80,
					targetPort: 8080,
					protocol: "TCP",
					nodePort: 30105,
				},
				{
					name: "https",
					port: 443,
					targetPort: 8443,
					protocol: "TCP",
					nodePort: 30106,
				},
			],
			externalTrafficPolicy: "Local",
			annotations: {
				"metallb.universe.tf/allow-shared-ip": "default",
			},
		},
		resources: {
			requests: {
				cpu: "10m",
				memory: "64Mi",
			},
			limits: {
				memory: "256Mi",
			},
		},
		autoscaling: {
			enabled: false,
		},
		labels: {
			"loliot.net/stack": variable.stackName,
		},
	},
});

const defaultGatewayName = "default-gateway";
const defaultGateway = new networking.v1alpha3.Gateway(defaultGatewayName, {
	metadata: {
		name: defaultGatewayName,
		namespace: namespace.metadata.name,
		labels: {
			"loliot.net/stack": variable.stackName,
		},
	},
	spec: {
		selector: {
			app: "istio-ingress",
		},
		servers: [
			{
				port: { number: 80, name: "http", protocol: "HTTP" },
				hosts: ["*"],
				tls: { httpsRedirect: true },
			},
			{
				port: { number: 443, name: "https", protocol: "HTTPS" },
				hosts: ["*.loliot.net", "loliot.net"],
				tls: {
					mode: "SIMPLE",
					credentialName: "loliot-net-ingress-cert",
				},
			},
		],
	},
});
