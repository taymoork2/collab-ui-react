import { HybridServicesUserSidepanelSectionComponent } from './hybrid-services-user-sidepanel-section.component';

import * as authinfoModuleName from 'modules/core/scripts/services/authinfo';
import calendarCloudConnectorModuleName from 'modules/hercules/services/calendar-cloud-connector.service';
import featureToggleServiceModuleName from 'modules/core/featureToggle';
import hybridServicesUtilsServiceModuleName from 'modules/hercules/services/hybrid-services-utils.service';
import serviceDescriptorModuleName from 'modules/hercules/services/service-descriptor.service';
import ussServiceModuleName from 'modules/hercules/services/uss.service';
import hybridServiceUserSidepanelHelperServiceModuleName from 'modules/hercules/services/hybrid-services-user-sidepanel-helper.service';
import userOverviewServiceModuleName from 'modules/core/users/userOverview';
import asyncIntervalModuleName from 'modules/core/shared/async-interval';

export default angular
  .module('hercules.user-sidepanel-section', [
    require('angular-ui-router'),
    asyncIntervalModuleName,
    authinfoModuleName,
    calendarCloudConnectorModuleName,
    featureToggleServiceModuleName,
    hybridServiceUserSidepanelHelperServiceModuleName,
    hybridServicesUtilsServiceModuleName,
    serviceDescriptorModuleName,
    ussServiceModuleName,
    userOverviewServiceModuleName,
  ])
  .component('hybridServicesUserSidepanelSection', new HybridServicesUserSidepanelSectionComponent())
  .name;
