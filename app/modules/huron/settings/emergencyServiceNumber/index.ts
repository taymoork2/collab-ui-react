import { EmergencyServiceNumberComponent } from './emergencyServiceNumber.component';

export default angular
  .module('huron.settings.emergency-service-number', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
  ])
  .component('ucEmergencyServiceNumber', new EmergencyServiceNumberComponent())
  .name;
