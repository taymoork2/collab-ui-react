import { LinkedSitesUserSettingsComponent } from './linked-sites-user-settings.component';

import userOverviewServiceModuleName from 'modules/core/users/userOverview';

export default angular
  .module('account-linking.user-settings', [
    userOverviewServiceModuleName,
  ])
  .component('linkedSitesUserSettings', new LinkedSitesUserSettingsComponent())
  .name;
