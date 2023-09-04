import * as kubernetes from "@pulumi/kubernetes";
import * as variable from "@src/variable";
import * as fs from "fs";
import * as path from "path";

const hhk7734GHCRName = "hhk7734-ghcr";
const hhk7734GHCR = new kubernetes.core.v1.Secret(hhk7734GHCRName, {
	metadata: {
		name: hhk7734GHCRName,
		namespace: "default",
		labels: {
			"loliot.net/stack": variable.stackName,
		},
	},
	type: "kubernetes.io/dockerconfigjson",
	stringData: {
		".dockerconfigjson": fs.readFileSync(
			path.join(__dirname, "../../../../.secret/default/hhk7734-ghcr.json"),
			"utf-8",
		),
	},
});
