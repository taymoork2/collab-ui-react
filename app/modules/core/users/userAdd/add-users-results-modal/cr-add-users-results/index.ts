import './cr-add-users-results.scss';

import { CrAddUsersResultsComponent } from './cr-add-users-results.component';
import * as analyticsModuleName from 'modules/core/analytics';
import onboardModuleName from 'modules/core/users/shared/onboard';

export default angular.module('core.users.userAdd.add-users-results-modal.cr-add-users-results', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  analyticsModuleName,
  onboardModuleName,
])
  .component('crAddUsersResults', new CrAddUsersResultsComponent())
  .name;
