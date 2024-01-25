import * as pulumi from '@pulumi/pulumi';

export const stackName = pulumi.getStack();

const config = new pulumi.Config();

export const githubGHCRKey = config.requireSecret('githubGHCRKey');

const authStack = new pulumi.StackReference('ap-northeast-2.loliot-net.auth');

export const auth = {
	certManager: authStack.getOutput('certManager')
};
