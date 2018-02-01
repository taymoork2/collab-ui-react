import './add-users-results-modal.scss';

import * as analyticsModuleName from 'modules/core/analytics';
import coreSharedModuleName from 'modules/core/shared';
import crAddUsersResultsModuleName from './cr-add-users-results';
import onboardModuleName from 'modules/core/users/shared/onboard';
import { AddUsersResultsModalComponent } from './add-users-results-modal.component';

export default angular.module('core.users.userAdd.add-users-results-modal', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  require('ct-ui-router-extras.previous').default,
  analyticsModuleName,
  coreSharedModuleName,
  crAddUsersResultsModuleName,
  onboardModuleName,
])
  .component('addUsersResultsModal', new AddUsersResultsModalComponent())
  .name;
