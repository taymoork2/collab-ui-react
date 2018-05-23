import { EmergencyServicesComponent } from './emergencyServices.component';

export default angular
  .module('trial.emergencyServices', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('emergencyServices', new EmergencyServicesComponent())
  .name;
