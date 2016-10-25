import { CallPickupSetupAssistantComponent } from './callPickupSetupAssistant.component';
import callPickupName from './callPickupName';

export default angular
  .module('huron.call-pickup.setup-assistant', [
    'atlas.templates',
    'cisco.ui',
    'pascalprecht.translate',
     callPickupName,
  ])
  .component('callPickupSetupAssistant', new CallPickupSetupAssistantComponent())
  .name;
