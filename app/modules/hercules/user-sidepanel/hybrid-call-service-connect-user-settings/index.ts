import { HybridCallServiceConnectUserSettingsComponent } from './hybrid-call-service-connect-user-settings.component';
import hybridServiceUserSidepanelHelperServiceModuleName from 'modules/hercules/services/hybrid-services-user-sidepanel-helper.service';
import serviceDescriptorServiceModuleName from 'modules/hercules/services/service-descriptor.service';
import userOverviewServiceModuleName from 'modules/core/users/userOverview';
import './_hybrid-call-service-connect-user-settings.scss';

export default angular
  .module('hercules.hybrid-call-service-connect-user-settings', [
    hybridServiceUserSidepanelHelperServiceModuleName,
    serviceDescriptorServiceModuleName,
    userOverviewServiceModuleName,
  ])
  .component('hybridCallServiceConnectUserSettings', new HybridCallServiceConnectUserSettingsComponent())
  .name;
