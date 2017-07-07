const WebExUtilsFact = require('./webExUtils.fact');
const iFrameResizableDirective = require('./iFrameResizeable.directive');

import xmlApiModule from 'modules/webex/xmlApi';
const authModule = require('modules/core/auth/auth');
const authInfoModule = require('modules/core/scripts/services/authinfo');

export default angular
  .module('webex.utils', [
    authModule,
    authInfoModule,
    xmlApiModule,
  ])
  .factory('WebExUtilsFact', WebExUtilsFact)
  .directive('iFrameResizable', iFrameResizableDirective)
  .name;
