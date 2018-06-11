import * as WebExRestApiFact from './restApi.fact';

import apiGatewaySharedModuleName from 'modules/webex/apiGateway/shared';

export default angular
  .module('webex.restApi', [
    apiGatewaySharedModuleName,
  ])
  .factory('WebExRestApiFact', WebExRestApiFact)
  .name;
