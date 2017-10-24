import { CrServicesPanelsComponent } from './cr-services-panels.component';

export default angular.module('core.users.userAdd.cr-services-panels', [
  require('angular-translate'),
  require('collab-ui-ng').default,
])
  .component('crServicesPanels', new CrServicesPanelsComponent())
  .name;
