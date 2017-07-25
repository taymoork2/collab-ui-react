import { MakeDefaultLocationComponent } from 'modules/call/locations/locations-make-default/locations-make-default.component';
import notifications from 'modules/core/notifications';
import locationsServiceModule from 'modules/call/locations/shared';

export { MakeDefaultLocationComponent };

export default angular
  .module('call.locations.make-default-location', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    notifications,
    locationsServiceModule,
  ])

  .component('ucMakeDefaultLocation', new MakeDefaultLocationComponent())
  .name;
