import { LinkedSitesUserSettingsComponent } from './linked-sites-user-settings.component';

import userOverviewModuleName from 'modules/core/users/userOverview';

export default angular
  .module('account-linking.user-sidepanel.linked-sites-user-settings', [
    userOverviewModuleName,
  ])
  .component('linkedSitesUserSettings', new LinkedSitesUserSettingsComponent())
  .name;
