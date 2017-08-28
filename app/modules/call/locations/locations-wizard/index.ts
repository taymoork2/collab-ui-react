import './locations-wizard.component.scss';

import { LocationsWizardComponent } from './locations-wizard.component';
import callLocationsModule from 'modules/call/locations';
import callSettingsModule from 'modules/call/settings';
import callHuntGroupModule from 'modules/call/features/hunt-group';
import callDestinationTranslate from 'modules/call/shared/call-destination-translate';
import pstnAddressServiceModule from 'modules/huron/pstn/shared/pstn-address';

export default angular.module('call.locations.wizard', [
  require('angular-translate'),
  require('scripts/app.templates'),
  require('collab-ui-ng').default,
  require('modules/core/config/config'),
  callLocationsModule,
  callSettingsModule,
  callHuntGroupModule,
  callDestinationTranslate,
  pstnAddressServiceModule,
])
.component('ucCallLocationsWizard', new LocationsWizardComponent())
.name;
