import { CopyLocationComponent } from 'modules/call/locations/locations-copy/locations-copy.component';
import notifications from 'modules/core/notifications';
import locationsServiceModule from 'modules/call/locations/shared';
import locationsNameModule from 'modules/call/locations/locations-name';
import settingSetupInitModule  from 'modules/call/settings/settings-setup-init';

export default angular
  .module('call.locations.copy-location', [
    require('@collabui/collab-ui-ng').default,
    notifications,
    locationsServiceModule,
    locationsNameModule,
    settingSetupInitModule,
  ])

  .component('ucCopyLocation', new CopyLocationComponent())
  .name;
