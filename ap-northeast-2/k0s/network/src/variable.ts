import * as pulumi from '@pulumi/pulumi';

export const stackName = pulumi.getStack();

const config = new pulumi.Config();

export const istioClusterName = stackName.split('.').slice(0, -1).join('-');
export const istioNetwork = stackName.split('.').slice(0, -1).join('-');
