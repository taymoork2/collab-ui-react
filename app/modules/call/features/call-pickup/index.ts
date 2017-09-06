import './call-pickup.component.scss';

import { CallPickupComponent } from './call-pickup.component';
import callPickupName from './call-pickup-name';
import callPickupMembers from './call-pickup-members';
import callPickupNotificationTimer from './call-pickup-notification-timer';
import callPickupNotifications from './call-pickup-notifications';
import callPickupGroupService from 'modules/call/features/call-pickup/shared';
import featureMemberService from 'modules/huron/features/services';

export default angular
  .module('call.call-pickup', [
    require('collab-ui-ng').default,
    require('angular-translate'),
    callPickupName,
    callPickupMembers,
    callPickupGroupService,
    callPickupNotificationTimer,
    callPickupNotifications,
    featureMemberService,
  ])
  .component('ucCallPickup', new CallPickupComponent())
  .name;
