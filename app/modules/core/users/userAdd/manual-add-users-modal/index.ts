import './manual-add-users-modal.scss';

import * as analyticsModuleName from 'modules/core/analytics';
import coreSharedModuleName from 'modules/core/shared';
import dirSyncServiceModuleName from 'modules/core/featureToggle';
import notificationModuleName from 'modules/core/notifications';
import userAddSharedModuleName from 'modules/core/users/userAdd/shared';
import crOnboardUsersModuleName from './cr-onboard-users';

import { ManualAddUsersModalComponent } from './manual-add-users-modal.component';

// notes:
// - include 'ui-router-extras' for use of '$previousState' in spec
require('ui-router-extras');

export default angular.module('core.users.userAdd.manual-add-users-modal', [
  require('angular-translate'),
  require('collab-ui-ng').default,
  'ct.ui.router.extras.previous',
  analyticsModuleName,
  coreSharedModuleName,
  dirSyncServiceModuleName,
  notificationModuleName,
  userAddSharedModuleName ,
  crOnboardUsersModuleName,
])
  .component('manualAddUsersModal', new ManualAddUsersModalComponent())
  .name;
