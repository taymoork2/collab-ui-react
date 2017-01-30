import { CallPickupNotificationTimerComponent } from './callPickupNotificationTimer.component';
import callPickupGroupService from 'modules/huron/features/callPickup/services/';

export default angular
  .module('huron.call-pickup.notificationtimer', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
    callPickupGroupService,
  ])
  .component('callPickupNotificationTimer',  new CallPickupNotificationTimerComponent())
  .name;
