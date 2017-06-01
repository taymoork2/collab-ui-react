let WebExXmlApiFact = require('./xmlApi.fact');
let WebExXmlApiConstsSvc = require('./xmlApiConsts.svc');
let WebExXmlApiInfoSvc = require('./xmlApiInfo.svc');

let authModule = require('modules/core/auth/auth');
let tokenModule = require('modules/core/auth/token.service');
let authInfoModule = require('modules/core/scripts/services/authinfo');

export default angular
  .module('webex.xmlApi', [
    authModule,
    authInfoModule,
    tokenModule,
  ])
  .factory('WebExXmlApiFact', WebExXmlApiFact)
  .service('WebExXmlApiConstsSvc', WebExXmlApiConstsSvc)
  .service('WebExXmlApiInfoSvc', WebExXmlApiInfoSvc)
  .name;
