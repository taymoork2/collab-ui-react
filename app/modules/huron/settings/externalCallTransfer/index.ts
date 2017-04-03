import { ExternalCallTransferComponent } from './externalCallTransfer.component';

export default angular
  .module('huron.settings.external-transfer', [
    'atlas.templates',
    'collab.ui',
  ])
  .component('ucExtTransferOrg', new ExternalCallTransferComponent())
  .name;
