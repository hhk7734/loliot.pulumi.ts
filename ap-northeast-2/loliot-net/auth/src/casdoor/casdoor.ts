import { namespace } from '@src/namespace';
import * as kubernetes from '@pulumi/kubernetes';
import * as path from 'path';
import * as variable from '@src/variable';
import * as pulumi from '@pulumi/pulumi';

const casdoorName = 'casdoor';
new kubernetes.helm.v3.Release(casdoorName, {
	name: casdoorName,
	chart: path.join(__dirname, '../../../../../charts/casdoor-helm-charts-v1.514.0.tgz'),
	namespace: namespace.metadata.name,
	maxHistory: 3,
	values: {
		fullnameOverride: casdoorName,
		config: pulumi.all([variable.casdoorPostgresPassword]).apply(
			(password) => `appname = casdoor
httpport = {{ .Values.service.port }}
runmode = dev
SessionOn = true
copyrequestbody = true
driverName = postgres
dataSourceName = "user=casdoor password=${password} host=postgresql.storage.svc.cluster.local port=5432 sslmode=disable dbname=casdoor"
dbName =
redisEndpoint =
defaultStorageProvider =
isCloudIntranet = false
authState = "casdoor"
socks5Proxy = ""
verificationCodeTimeout = 10
initScore = 0
logPostOnly = true
origin =
enableGzip = true`
		),
		tolerations: [
			{
				key: 'node-role.kubernetes.io/master',
				operator: 'Exists',
				effect: 'NoSchedule'
			}
		],
		affinity: {
			nodeAffinity: {
				requiredDuringSchedulingIgnoredDuringExecution: {
					nodeSelectorTerms: [
						{
							matchExpressions: [
								{
									key: 'node-role.kubernetes.io/control-plane',
									operator: 'In',
									values: ['true']
								}
							]
						}
					]
				}
			}
		}
	}
});
