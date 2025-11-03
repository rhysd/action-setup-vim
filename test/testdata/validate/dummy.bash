#!/bin/bash

if [[ "$1" != "--version" ]]; then
    echo "--version is not specified in arguments: $*"
    exit 1
fi
