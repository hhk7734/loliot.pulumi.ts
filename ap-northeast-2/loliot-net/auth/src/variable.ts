import * as pulumi from '@pulumi/pulumi';

export const stackName = pulumi.getStack();

const config = new pulumi.Config();

export const cloudflareAPIToken = config.requireSecret('cloudflareAPIToken');
