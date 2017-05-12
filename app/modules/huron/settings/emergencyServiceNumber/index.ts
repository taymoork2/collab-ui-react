import { EmergencyServiceNumberComponent } from './emergencyServiceNumber.component';
import phoneNumberModule from 'modules/huron/phoneNumber';

export default angular
  .module('huron.settings.emergency-service-number', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    phoneNumberModule,
  ])
  .component('ucEmergencyServiceNumber', new EmergencyServiceNumberComponent())
  .name;
