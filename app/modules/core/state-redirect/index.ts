import collabUiModuleName from '@collabui/collab-ui-ng';
import * as authModuleName from 'modules/core/auth/auth';
import 'modules/core/shared/cui-panel/cui-panel.scss';
import sharedModuleName from './shared';
import { StateRedirectActionComponent } from './state-redirect-action.component';
import { StateRedirectWarningComponent } from './state-redirect-warning.component';

export default angular
  .module('core.state-redirect', [
    authModuleName,
    collabUiModuleName,
    sharedModuleName,
  ])
  .component('stateRedirectAction', new StateRedirectActionComponent())
  .component('stateRedirectWarning', new StateRedirectWarningComponent())
  .name;
