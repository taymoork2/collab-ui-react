import { HybridCalendarServiceUserSettingsComponent } from './hybrid-calendar-service-user-settings.component';

import calendarCloudConnectorModuleName from 'modules/hercules/services/calendar-cloud-connector.service';
import hybridServiceUserSidepanelHelperServiceModuleName from 'modules/hercules/services/hybrid-services-user-sidepanel-helper.service';
import hybridServicesUtilsServiceModuleName from 'modules/hercules/services/hybrid-services-utils.service';
import userOverviewServiceModuleName from 'modules/core/users/userOverview';
import serviceDescriptorServiceModuleName from 'modules/hercules/services/service-descriptor.service';

export default angular
  .module('hercules.hybrid-calendar-service-user-settings', [
    calendarCloudConnectorModuleName,
    hybridServiceUserSidepanelHelperServiceModuleName,
    hybridServicesUtilsServiceModuleName,
    userOverviewServiceModuleName,
    serviceDescriptorServiceModuleName,
  ])
  .component('hybridCalendarServiceUserSettings', new HybridCalendarServiceUserSettingsComponent())
  .name;
