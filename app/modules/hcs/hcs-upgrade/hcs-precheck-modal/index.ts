import { HcsPrecheckModalComponent } from './hcs-precheck-modal.component';

export default angular
  .module('hcs.precheckModal', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('hcsPrecheckModal', new HcsPrecheckModalComponent())
  .name;
