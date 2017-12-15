import { HybridServicesUserSidepanelSectionComponent } from './hybrid-services-user-sidepanel-section.component';

import * as AuthinfoModuleName from 'modules/core/scripts/services/authinfo';
import CalendarCloudConnectorModuleName from 'modules/hercules/services/calendar-cloud-connector.service';
import FeatureToggleServiceModuleName from 'modules/core/featureToggle';
import HybridServicesUtilsServiceModuleName from 'modules/hercules/services/hybrid-services-utils.service';
import ServiceDescriptorModuleName from 'modules/hercules/services/service-descriptor.service';
import USSServiceModuleName from 'modules/hercules/services/uss.service';
import hybridServiceUserSidepanelHelperServiceModuleName from 'modules/hercules/services/hybrid-services-user-sidepanel-helper.service';

export default angular
  .module('hercules.user-sidepanel-section', [
    require('angular-ui-router'),
    hybridServiceUserSidepanelHelperServiceModuleName,
    AuthinfoModuleName,
    CalendarCloudConnectorModuleName,
    FeatureToggleServiceModuleName,
    HybridServicesUtilsServiceModuleName,
    ServiceDescriptorModuleName,
    USSServiceModuleName,
  ])
  .component('hybridServicesUserSidepanelSection', new HybridServicesUserSidepanelSectionComponent())
  .name;
