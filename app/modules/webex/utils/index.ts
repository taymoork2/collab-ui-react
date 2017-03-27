let WebExUtilsFact = require('./webExUtils.fact');
let iFrameResizableDirective = require('./iFrameResizeable.directive');

import xmlApiModule from 'modules/webex/xmlApi';
let authModule = require('modules/core/auth/auth');
let authInfoModule = require('modules/core/scripts/services/authinfo');

export default angular
  .module('webex.utils', [
    authModule,
    authInfoModule,
    xmlApiModule,
  ])
  .factory('WebExUtilsFact', WebExUtilsFact)
  .directive('iFrameResizable', iFrameResizableDirective)
  .name;
