import { HybridCallServiceAwareUserSettingsComponent } from './hybrid-call-service-aware-user-settings.component';
import domainManagementServiceModuleName from 'modules/core/domainManagement';
import hybridServiceUserSidepanelHelperServiceModuleName from 'modules/hercules/services/hybrid-services-user-sidepanel-helper.service';
import modalServiceModuleName from 'modules/core/modal';
import uccServiceModuleName from 'modules/hercules/services/ucc-service';
import uriVerificationServiceModuleName from 'modules/hercules/services/uri-verification-service';
import './_hybrid-call-service-aware-user-settings.scss';

export default angular
  .module('hercules.hybrid-call-service-aware-user-settings', [
    domainManagementServiceModuleName,
    hybridServiceUserSidepanelHelperServiceModuleName,
    modalServiceModuleName,
    uccServiceModuleName,
    uriVerificationServiceModuleName,
  ])
  .component('hybridCallServiceAwareUserSettings', new HybridCallServiceAwareUserSettingsComponent())
  .name;
