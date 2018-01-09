import { HybridMessageUserSettingsComponent } from './hybrid-messaging-user-settings.component';
import hybridServiceUserSidepanelHelperServiceModuleName from 'modules/hercules/services/hybrid-services-user-sidepanel-helper.service';
import './_hybrid-messaging-user-settings.scss';

export default angular
  .module('hercules.hybrid-message-user-settings', [
    hybridServiceUserSidepanelHelperServiceModuleName,
  ])
  .component('hybridMessageUserSettings', new HybridMessageUserSettingsComponent())
  .name;
