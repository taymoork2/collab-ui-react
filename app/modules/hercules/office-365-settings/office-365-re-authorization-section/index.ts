import './office-365-re-authorization-section.scss';

import { Office365ReAuthorizationSectionComponent } from './office-365-re-authorization-section.component';

export default angular.module('hercules.office-365-settings.office-365-re-authorization-section', [
  require('angular-translate'),
  require('collab-ui-ng').default,
])
  .component('office365ReAuthorizationSection', new Office365ReAuthorizationSectionComponent())
  .name;
