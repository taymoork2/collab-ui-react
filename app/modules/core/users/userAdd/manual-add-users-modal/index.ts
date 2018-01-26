import './manual-add-users-modal.scss';

import * as analyticsModuleName from 'modules/core/analytics';
import coreSharedModuleName from 'modules/core/shared';
import dirSyncServiceModuleName from 'modules/core/featureToggle';
import notificationModuleName from 'modules/core/notifications';
import onboardModuleName from 'modules/core/users/shared/onboard';
import usersSharedAutoAssignTemplateModuleName from 'modules/core/users/shared/auto-assign-template';
import crOnboardUsersModuleName from './cr-onboard-users';

import { ManualAddUsersModalComponent } from './manual-add-users-modal.component';

export default angular.module('core.users.userAdd.manual-add-users-modal', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  require('ct-ui-router-extras.previous').default,
  analyticsModuleName,
  coreSharedModuleName,
  dirSyncServiceModuleName,
  notificationModuleName,
  onboardModuleName,
  usersSharedAutoAssignTemplateModuleName,
  crOnboardUsersModuleName,
])
  .component('manualAddUsersModal', new ManualAddUsersModalComponent())
  .name;
