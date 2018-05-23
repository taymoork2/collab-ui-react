import './call-pickup.component.scss';

import { CallPickupComponent } from './call-pickup.component';
import { CallPickupAddDirectiveFactory } from './call-pickup-add.directive';
import { CallPickupEditDirectiveFactory } from './call-pickup-edit.directive';
import callPickupName from './call-pickup-name';
import callPickupMembers from './call-pickup-members';
import callPickupNotificationTimer from './call-pickup-notification-timer';
import callPickupNotifications from './call-pickup-notifications';
import callPickupGroupService from 'modules/call/features/call-pickup/shared';
import featureMemberService from 'modules/huron/features/services';

export default angular
  .module('call.call-pickup', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    callPickupName,
    callPickupMembers,
    callPickupGroupService,
    callPickupNotificationTimer,
    callPickupNotifications,
    featureMemberService,
  ])
  .component('ucCallPickup', new CallPickupComponent())
  .directive('ucCallPickupAdd', CallPickupAddDirectiveFactory)
  .directive('ucCallPickupEdit', CallPickupEditDirectiveFactory)
  .name;
