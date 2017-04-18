import { EmergencyServiceAddressComponent } from './emergencyServiceAddress.component';
import notifications from 'modules/core/notifications';
import serviceAddressModule from 'modules/huron/serviceAddress';

export default angular
  .module('huron.settings.emergency-service-address', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    notifications,
    serviceAddressModule,
  ])
  .component('ucEmergencyServiceAddress', new EmergencyServiceAddressComponent())
  .name;
