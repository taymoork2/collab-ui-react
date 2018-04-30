import * as WebExApiGatewayService from './apiGateway.svc';

import sharedModuleName from './shared';

import * as authInfoModule from 'modules/core/scripts/services/authinfo';
import * as tokenModule from 'modules/core/auth/token.service';
import utilsFactModuleName from 'modules/webex/utils';
import restApiModuleName from 'modules/webex/restApi';
import xmlApiModuleName from 'modules/webex/xmlApi';

export default angular
  .module('webex.apiGateway', [
    sharedModuleName,
    authInfoModule,
    tokenModule,
    utilsFactModuleName,
    restApiModuleName,
    xmlApiModuleName,
  ])
  .service('WebExApiGatewayService', WebExApiGatewayService)
  .name;
