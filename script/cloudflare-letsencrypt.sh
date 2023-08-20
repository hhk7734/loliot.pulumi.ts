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

kubectl create secret generic cloudflare-api-token-letsencrypt \
    --context=loliot \
    -n auth \
    --from-file=token=$BASEDIR/../.secret/auth/cloudflare-letsencrypt.txt
