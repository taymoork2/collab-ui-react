import { DeleteLocationComponent } from 'modules/call/locations/locations-delete/locations-delete.component';
import notifications from 'modules/core/notifications';
import locationsServiceModule from 'modules/call/locations/shared';

export { DeleteLocationComponent };

export default angular
  .module('call.locations.delete-location', [
    require('@collabui/collab-ui-ng').default,
    notifications,
    locationsServiceModule,
  ])

  .component('ucDeleteLocation', new DeleteLocationComponent())
  .name;
