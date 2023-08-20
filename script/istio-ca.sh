#!/bin/sh

realpath2() (
    OURPWD=$PWD
    cd "$(dirname "$1")"
    LINK=$(readlink "$(basename "$1")")
    while [ "$LINK" ]; do
        cd "$(dirname "$LINK")"
        LINK=$(readlink "$(basename "$1")")
    done
    REALPATH="$PWD/$(basename "$1")"
    cd "$OURPWD"
    echo "$REALPATH"
)

BASEDIR=$(dirname $(realpath2 "$0"))

set -e

kubectl create secret generic istio-ca \
    --context=loliot \
    -n istio-system \
    --from-file=tls.crt=$BASEDIR/../.secret/istio-system/istio-ca/tls.crt \
    --from-file=tls.key=$BASEDIR/../.secret/istio-system/istio-ca/tls.key

kubectl create secret generic istio-root-ca \
    --context=loliot \
    -n auth \
    --from-file=ca.pem=$BASEDIR/../.secret/istio-system/istio-ca/tls.crt
