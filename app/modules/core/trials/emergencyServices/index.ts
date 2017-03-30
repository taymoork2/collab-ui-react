import { EmergencyServicesComponent } from './emergencyServices.component';

export default angular
  .module('trial.emergencyServices', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    'pascalprecht.translate',
  ])
  .component('emergencyServices', new EmergencyServicesComponent())
  .name;
