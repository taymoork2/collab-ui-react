import { HybridServicesUserSidepanelSectionComponent } from './hybrid-services-user-sidepanel-section.component';

import * as authinfoModuleName from 'modules/core/scripts/services/authinfo';
import calendarCloudConnectorModuleName from 'modules/hercules/services/calendar-cloud-connector.service';
import featureToggleServiceModuleName from 'modules/core/featureToggle';
import hybridServicesUtilsServiceModuleName from 'modules/hercules/services/hybrid-services-utils.service';
import serviceDescriptorModuleName from 'modules/hercules/services/service-descriptor.service';
import ussServiceModuleName from 'modules/hercules/services/uss.service';
import hybridServiceUserSidepanelHelperServiceModuleName from 'modules/hercules/services/hybrid-services-user-sidepanel-helper.service';
import userOverviewServiceModuleName from 'modules/core/users/userOverview';

export default angular
  .module('hercules.user-sidepanel-section', [
    require('angular-ui-router'),
    hybridServiceUserSidepanelHelperServiceModuleName,
    authinfoModuleName,
    calendarCloudConnectorModuleName,
    featureToggleServiceModuleName,
    hybridServicesUtilsServiceModuleName,
    serviceDescriptorModuleName,
    ussServiceModuleName,
    userOverviewServiceModuleName,
  ])
  .component('hybridServicesUserSidepanelSection', new HybridServicesUserSidepanelSectionComponent())
  .name;
