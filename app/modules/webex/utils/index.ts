const WebExUtilsFact = require('./webExUtils.fact');
const iFrameResizableDirective = require('./iFrameResizeable.directive');

import windowModuleName from 'modules/core/window';
import xmlApiModuleName from 'modules/webex/xmlApi';
const authModuleName = require('modules/core/auth/auth');
const authInfoModuleName = require('modules/core/scripts/services/authinfo');

export default angular
  .module('webex.utils', [
    authModuleName,
    authInfoModuleName,
    windowModuleName,
    xmlApiModuleName,
  ])
  .factory('WebExUtilsFact', WebExUtilsFact)
  .directive('iFrameResizable', iFrameResizableDirective)
  .name;
