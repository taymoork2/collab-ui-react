import { ExternalCallTransferComponent } from './externalCallTransfer.component';

export default angular
  .module('huron.settings.external-transfer', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
  ])
  .component('ucExtTransferOrg', new ExternalCallTransferComponent())
  .name;
