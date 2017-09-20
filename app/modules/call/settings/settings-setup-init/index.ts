import './settings-setup-init.component.scss';

import { SettingSetupInitComponent } from 'modules/call/settings/settings-setup-init/settings-setup-init.component';
import { SettingSetupInitService } from 'modules/call/settings/settings-setup-init/settings-setup-init.service';

export { SettingSetupInitComponent };
export { SettingSetupInitService };

export default angular
  .module('call.settings.settings-setup-init', [
    require('collab-ui-ng').default,
  ])
  .component('ucSettingsInit', new SettingSetupInitComponent())
  .service('SettingSetupInitService', SettingSetupInitService)
  .name;
