import * as authModuleName from 'modules/core/auth/auth';
import 'modules/core/shared/cui-panel/cui-panel.scss';
import sharedModuleName from './shared';
import { StateRedirectCtrl } from './state-redirect.controller';

export default angular
  .module('core.state-redirct', [
    authModuleName,
    sharedModuleName,
  ])
  .controller('StateRedirectCtrl', StateRedirectCtrl)
  .name;
