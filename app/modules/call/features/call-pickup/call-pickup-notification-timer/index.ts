import { CallPickupNotificationTimerComponent } from './call-pickup-notification-timer.component';
import callPickupGroupService from 'modules/call/features/call-pickup/shared/';

export default angular
  .module('call.call-pickup.notification-timer', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    callPickupGroupService,
  ])
  .component('ucCallPickupNotificationTimer',  new CallPickupNotificationTimerComponent())
  .name;
