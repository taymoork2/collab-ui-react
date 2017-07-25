import { CopyLocationComponent } from 'modules/call/locations/locations-copy/locations-copy.component';
import notifications from 'modules/core/notifications';
import locationsServiceModule from 'modules/call/locations/shared';

export default angular
  .module('call.locations.copy-location', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    notifications,
    locationsServiceModule,
  ])

  .component('ucCopyLocation', new CopyLocationComponent())
  .name;
