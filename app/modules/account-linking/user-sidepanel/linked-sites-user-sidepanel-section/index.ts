import { LinkedSitesUserSidepanelSectionComponent } from './linked-sites-user-sidepanel-section.component';

export default angular
  .module('account-linking.linked-sites-user-sidepanel-section', [
    require('angular-ui-router'),
  ])
  .component('linkedSitesUserSidepanelSection', new LinkedSitesUserSidepanelSectionComponent())
  .name;
