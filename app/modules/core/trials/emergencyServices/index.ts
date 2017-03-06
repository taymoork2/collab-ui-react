import { EmergencyServicesComponent } from './emergencyServices.component';

export default angular
  .module('trial.emergencyServices', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
  ])
  .component('emergencyServices', new EmergencyServicesComponent())
  .name;
