import { HcsSetupSoftwareProfileComponent } from './hcs-setup-software-profile.component';

export default angular
  .module('hcs.setup-software-profile', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('hcsSetupSoftwareProfile', new HcsSetupSoftwareProfileComponent())
  .name;
