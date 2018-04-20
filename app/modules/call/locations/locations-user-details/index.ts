import { UserLocationDetailsComponent } from 'modules/call/locations/locations-user-details/locations-user-details.component';
import notifications from 'modules/core/notifications';
import callLocationsModule from 'modules/call/locations';
import usersModule from 'modules/huron/users';

export { UserLocationDetailsComponent };
export * from './locations-user-details.component';

export default angular
  .module('call.locations.locations-user-details', [
    require('@collabui/collab-ui-ng').default,
    notifications,
    callLocationsModule,
    usersModule,
  ])
  .component('ucUserLocationDetails', new UserLocationDetailsComponent())
  .name;
