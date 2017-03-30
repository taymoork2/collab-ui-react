import { CallPickupNotificationsComponent } from './callPickupNotifications.component';
import callPickupGroupService from 'modules/huron/features/callPickup/services/';

export default angular
  .module('huron.call-pickup.notifications', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    'pascalprecht.translate',
    callPickupGroupService,
  ])
  .component('callPickupNotifications',  new CallPickupNotificationsComponent())
  .name;
