const WebExXmlApiFact = require('./xmlApi.fact');
const WebExXmlApiConstsSvc = require('./xmlApiConsts.svc');
const WebExXmlApiInfoSvc = require('./xmlApiInfo.svc');

const authModule = require('modules/core/auth/auth');
const tokenModule = require('modules/core/auth/token.service');
const authInfoModule = require('modules/core/scripts/services/authinfo');

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
