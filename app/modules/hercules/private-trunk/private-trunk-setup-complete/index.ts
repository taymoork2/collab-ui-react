import { PrivateTrunkSetupCompleteComponent } from './private-trunk-setup-complete.component';

export default angular
  .module('hercules.private-trunk-setup-complete', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('privateTrunkSetupComplete', new PrivateTrunkSetupCompleteComponent())
  .name;
