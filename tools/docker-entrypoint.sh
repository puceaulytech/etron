#!/bin/sh

if [ "$#" -eq 0 ]; then
    echo "No service specified, exiting..."
    exit 1
fi

SERVICE=$1

node services/$SERVICE/index.js "${@:2}"
