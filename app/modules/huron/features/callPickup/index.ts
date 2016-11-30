import { CallPickupSetupAssistantComponent } from './callPickupSetupAssistant.component';
import callPickupName from './callPickupName';
import callPickupMembers from './callPickupMembers';
import callPickupGroupService from 'modules/huron/features/callPickup/services';

export default angular
  .module('huron.call-pickup.setup-assistant', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
     callPickupName,
     callPickupMembers,
     callPickupGroupService,
  ])
  .component('callPickupSetupAssistant', new CallPickupSetupAssistantComponent())
  .name;
