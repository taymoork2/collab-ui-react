import { UserLocationDetailsComponent } from 'modules/call/locations/locations-user-details/locations-user-details.component';
import notifications from 'modules/core/notifications';
import callLocationsModule from 'modules/call/locations';

export { UserLocationDetailsComponent };

export default angular
  .module('call.locations.locations-user-details', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    notifications,
    callLocationsModule,
  ])
  .component('ucUserLocationDetails', new UserLocationDetailsComponent())
  .name;
