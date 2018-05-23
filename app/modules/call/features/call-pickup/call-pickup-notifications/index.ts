import { CallPickupNotificationsComponent } from './call-pickup-notifications.component';
import callPickupGroupService from 'modules/call/features/call-pickup/shared';

export default angular
  .module('call.call-pickup.notifications', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    callPickupGroupService,
  ])
  .component('ucCallPickupNotifications',  new CallPickupNotificationsComponent())
  .name;
