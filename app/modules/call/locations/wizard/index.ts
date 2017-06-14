import { LocationsWizardComponent } from './locationsWizard.component';

let callLocations = 'call.locations';
export default angular.module('call.locations.wizard', [
  callLocations,
])
  .component('ucCallLocationsWizard', new LocationsWizardComponent())
  .name;
