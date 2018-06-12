import './locations-wizard.component.scss';

import { LocationsWizardComponent } from './locations-wizard.component';
import callLocationsModule from 'modules/call/locations';
import callSettingsModule from 'modules/call/settings';
import callHuntGroupModule from 'modules/call/features/hunt-group';
import callDestinationTranslateModule from 'modules/call/shared/call-destination-translate';
import callEmergencyServicesModule from 'modules/call/shared/call-emergency-services';
import pstnAddressServiceModule from 'modules/huron/pstn/shared/pstn-address';

export default angular.module('call.locations.wizard', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  require('modules/core/config/config').default,
  callLocationsModule,
  callSettingsModule,
  callHuntGroupModule,
  callDestinationTranslateModule,
  callEmergencyServicesModule,
  pstnAddressServiceModule,
])
  .component('ucCallLocationsWizard', new LocationsWizardComponent())
  .name;
