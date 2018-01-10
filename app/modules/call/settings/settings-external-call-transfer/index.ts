import { ExternalCallTransferComponent } from './settings-external-call-transfer.component';

export default angular
  .module('call.settings.external-transfer', [
    require('@collabui/collab-ui-ng').default,
  ])
  .component('ucExtTransferOrg', new ExternalCallTransferComponent())
  .name;
