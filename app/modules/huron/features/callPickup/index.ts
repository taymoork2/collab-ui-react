import './_call-pickup.scss';

import { CallPickupSetupAssistantComponent } from './callPickupSetupAssistant.component';
import callPickupName from './callPickupName';
import callPickupMembers from './callPickupMembers';
import callPickupNotificationTimer from './callPickupNotificationTimer';
import callPickupNotifications from './callPickupNotifications';
import callPickupGroupService from 'modules/huron/features/callPickup/services';
import featureMemberService from 'modules/huron/features/services';

export default angular
  .module('huron.call-pickup.setup-assistant', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    callPickupName,
    callPickupMembers,
    callPickupGroupService,
    callPickupNotificationTimer,
    callPickupNotifications,
    featureMemberService,
  ])
  .component('callPickupSetupAssistant', new CallPickupSetupAssistantComponent())
  .name;
