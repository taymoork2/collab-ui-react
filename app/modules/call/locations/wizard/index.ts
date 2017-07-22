import { LocationsWizardComponent } from './locations-wizard.component';

const callLocations = 'call.locations';
export default angular.module('call.locations.wizard', [
  callLocations,
])
.component('ucCallLocationsWizard', new LocationsWizardComponent())
.name;
