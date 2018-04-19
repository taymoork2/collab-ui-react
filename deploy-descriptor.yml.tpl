# notes:
# - this file is NOT related to our webpack build config (https://webpack.js.org/)
# - instead, this deploy descriptor is used by our build pipeline to enable job integration for deployments

id: atlas-web
appname: atlas-web
name: "Atlas Web"
version: $BUILD_NUMBER
deploy-file: ./wx2-admin-web-client.$BUILD_TAG.tar.gz
owner:
  email: mrmccann@cisco.com
  # as of 2018-04-17, use Atlas BEMS service (mapped to page Atlas web core team)
  pagerduty: https://ciscospark.pagerduty.com/services/PXYHAML
