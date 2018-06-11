import { HybridMessageUserSettingsComponent } from './hybrid-messaging-user-settings.component';
import hybridServiceUserSidepanelHelperServiceModuleName from 'modules/hercules/services/hybrid-services-user-sidepanel-helper.service';
import serviceDescriptorServiceModuleName from 'modules/hercules/services/service-descriptor.service';
import userOverviewServiceModuleName from 'modules/core/users/userOverview';
import './_hybrid-messaging-user-settings.scss';

export default angular
  .module('hercules.hybrid-message-user-settings', [
    hybridServiceUserSidepanelHelperServiceModuleName,
    serviceDescriptorServiceModuleName,
    userOverviewServiceModuleName,
  ])
  .component('hybridMessageUserSettings', new HybridMessageUserSettingsComponent())
  .name;
