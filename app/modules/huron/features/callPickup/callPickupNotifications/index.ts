import { CallPickupNotificationsComponent } from './callPickupNotifications.component';
import callPickupGroupService from 'modules/huron/features/callPickup/services/';

export default angular
  .module('huron.call-pickup.notifications', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
    callPickupGroupService,
  ])
  .component('callPickupNotifications',  new CallPickupNotificationsComponent())
  .name;
