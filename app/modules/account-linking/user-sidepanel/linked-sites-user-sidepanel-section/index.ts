import { LinkedSitesUserSidepanelSectionComponent } from './linked-sites-user-sidepanel-section.component';
import FeatureToggleServiceModuleName from 'modules/core/featureToggle/index';

export default angular
  .module('account-linking.user-sidepanel-section', [
    require('angular-ui-router'),
    FeatureToggleServiceModuleName,
  ])
  .component('linkedSitesUserSidepanelSection', new LinkedSitesUserSidepanelSectionComponent())
  .name;
