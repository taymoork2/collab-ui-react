import './locations-wizard.component.scss';

import { LocationsWizardComponent } from './locations-wizard.component';
import callLocationsModule from 'modules/call/locations';

export default angular.module('call.locations.wizard', [
  require('scripts/app.templates'),
  require('collab-ui-ng').default,
  callLocationsModule,
])
.component('ucCallLocationsWizard', new LocationsWizardComponent())
.name;
