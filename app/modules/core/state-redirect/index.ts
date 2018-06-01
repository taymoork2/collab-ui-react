import * as authModuleName from 'modules/core/auth/auth';
import sharedModuleName from './shared';
import * as StateRedirectCtrl from './stateRedirect.controller';

export default angular
  .module('core.state-redirct', [
    authModuleName,
    sharedModuleName,
  ])
  .controller('StateRedirectCtrl', StateRedirectCtrl)
  .name;
