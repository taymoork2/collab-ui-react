import { CallPickupNotificationTimerComponent } from './callPickupNotificationTimer.component';
import callPickupGroupService from 'modules/huron/features/callPickup/services/';

export default angular
  .module('huron.call-pickup.notificationtimer', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    'pascalprecht.translate',
    callPickupGroupService,
  ])
  .component('callPickupNotificationTimer',  new CallPickupNotificationTimerComponent())
  .name;
