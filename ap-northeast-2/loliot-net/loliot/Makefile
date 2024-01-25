.PHONY: up
up: passphrase
	pulumi up -s ap-northeast-2.loliot-net.loliot

.PHONY: passphrase
passphrase:
	export PULUMI_CONFIG_PASSPHRASE_FILE=../../../.secret/ap-northeast-2.loliot-net.pulumi
