import { SetupServiceSelectionComponent } from './setup-service-selection.component';

export default angular
  .module('hcs.setup-service-selection', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('setupServiceSelection', new SetupServiceSelectionComponent())
  .name;
