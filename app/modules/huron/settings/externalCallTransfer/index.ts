import { ExternalCallTransferComponent } from './externalCallTransfer.component';

export default angular
  .module('huron.settings.external-transfer', [
    require('scripts/app.templates'),
    'collab.ui',
  ])
  .component('ucExtTransferOrg', new ExternalCallTransferComponent())
  .name;
