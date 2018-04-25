#!/bin/bash

printf '{ "id": "%s" }\n' "$(git log -n1 --pretty="%H")"
