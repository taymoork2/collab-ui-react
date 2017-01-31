import './_call-pickup.scss';

import { CallPickupSetupAssistantComponent } from './callPickupSetupAssistant.component';
import callPickupName from './callPickupName';
import callPickupMembers from './callPickupMembers';
import callPickupNotificationTimer from './callPickupNotificationTimer';
import callPickupNotifications from './callPickupNotifications';
import callPickupGroupService from 'modules/huron/features/callPickup/services';
import featureMemberService from 'modules/huron/features';

export default angular
  .module('huron.call-pickup.setup-assistant', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
     callPickupName,
     callPickupMembers,
     callPickupGroupService,
     callPickupNotificationTimer,
     callPickupNotifications,
     featureMemberService,
  ])
  .component('callPickupSetupAssistant', new CallPickupSetupAssistantComponent())
  .name;
