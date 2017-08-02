import { LocationsVoicemailAvrilComponent } from './locations-voicemail-avril.component';

export default angular
  .module('call.locations.locations-voicemail-avril', [
    require('angular-translate'),
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('modules/core/featureToggle').default,
  ])
  .component('ucLocationVoicemailAvril', new LocationsVoicemailAvrilComponent())
  .name;
