import * as pulumi from '@pulumi/pulumi';

export const stackName = pulumi.getStack();

export const clusterName = stackName.split('.').slice(0, -1).join('-');
export const istioNetwork = stackName.split('.').slice(0, -1).join('-');

const config = new pulumi.Config();

export const k8sServiceHost = config.requireSecret('k8sServiceHost');
export const istioCATLSKey = config.requireSecret('istioCATLSKey');
export const istioCATLSCert = config.requireSecret('istioCATLSCert');
