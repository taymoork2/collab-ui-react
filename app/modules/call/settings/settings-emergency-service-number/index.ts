import { EmergencyServiceNumberComponent } from './settings-emergency-service-number.component';
import phoneNumberModule from 'modules/huron/phoneNumber';

export default angular
  .module('call.settings.emergency-service-number', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    phoneNumberModule,
  ])
  .component('ucEmergencyServiceNumber', new EmergencyServiceNumberComponent())
  .name;
