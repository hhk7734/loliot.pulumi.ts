export PULUMI_CONFIG_PASSPHRASE_FILE=../../../.secret/ap-northeast-2.loliot-net.pulumi

.PHONY: refresh
refresh:
	pulumi refresh -s ap-northeast-2.loliot-net.auth

.PHONY: up
up:
	pulumi up -s ap-northeast-2.loliot-net.auth
