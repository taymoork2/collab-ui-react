import { SettingSetupInitService } from 'modules/call/settings/settings-setup-init/settings-setup-init.service';

export { SettingSetupInitService };

export default angular
  .module('call.settings.settings-setup-init', [])
  .service('SettingSetupInitService', SettingSetupInitService)
  .name;
