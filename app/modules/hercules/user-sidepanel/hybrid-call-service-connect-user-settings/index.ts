import { HybridCallServiceConnectUserSettingsComponent } from './hybrid-call-service-connect-user-settings.component';
import hybridServiceUserSidepanelHelperServiceModuleName from 'modules/hercules/services/hybrid-services-user-sidepanel-helper.service';
import './_hybrid-call-service-connect-user-settings.scss';

export default angular
  .module('hercules.hybrid-call-service-connect-user-settings', [
    hybridServiceUserSidepanelHelperServiceModuleName,
  ])
  .component('hybridCallServiceConnectUserSettings', new HybridCallServiceConnectUserSettingsComponent())
  .name;
