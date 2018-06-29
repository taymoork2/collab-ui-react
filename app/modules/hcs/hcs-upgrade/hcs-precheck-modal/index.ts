import { HcsPrecheckModalComponent } from './hcs-precheck-modal.component';

export default angular
  .module('hcs.precheckModal', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    require('modules/hcs/hcs-shared').default,
  ])
  .component('hcsPrecheckModal', new HcsPrecheckModalComponent())
  .name;
