import { EmergencyServiceAddressComponent } from './settings-emergency-service-address.component';
import notifications from 'modules/core/notifications';
import serviceAddressModule from 'modules/huron/serviceAddress';

export default angular
  .module('call.settings.emergency-service-address', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    notifications,
    serviceAddressModule,
  ])
  .component('ucEmergencyServiceAddress', new EmergencyServiceAddressComponent())
  .name;
