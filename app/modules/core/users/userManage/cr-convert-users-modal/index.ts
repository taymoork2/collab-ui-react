import './cr-convert-users-modal.scss';

import { CrConvertUsersModalComponent } from './cr-convert-users-modal.component';
import * as ngTranslateModuleName from 'angular-translate';
import collabUiModuleName from '@collabui/collab-ui-ng';
import * as analyticsModuleName from 'modules/core/analytics';
import * as authInfoModuleName from 'modules/core/scripts/services/authinfo';
import autoAssignTemplateModuleName from 'modules/core/users/shared/auto-assign-template';
import dirSyncServiceModuleName from 'modules/core/featureToggle';
import onboardModuleName from 'modules/core/users/shared/onboard';
import * as orgServiceModule from 'modules/core/scripts/services/org.service';

// 'ui.grid', // TODO: rm this once ui-grid replaced with cs-grid
//import angularUiGridModuleName from 'angular-ui-grid';
require('angular-ui-grid/ui-grid.js');

export default angular.module('core.users.userManage.cr-convert-users-modal', [
  ngTranslateModuleName,
  collabUiModuleName,
  analyticsModuleName,
  authInfoModuleName,
  autoAssignTemplateModuleName,
  dirSyncServiceModuleName,
  onboardModuleName,
  orgServiceModule,
  'ui.grid',
])
  .component('crConvertUsersModal', new CrConvertUsersModalComponent())
  .name;
