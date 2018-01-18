import { HybridCalendarServiceUserSettingsComponent } from './hybrid-calendar-service-user-settings.component';

import calendarCloudConnectorModuleName from 'modules/hercules/services/calendar-cloud-connector.service';
import hybridServicesClusterServiceModuleName from 'modules/hercules/services/hybrid-services-cluster.service';
import hybridServiceUserSidepanelHelperServiceModuleName from 'modules/hercules/services/hybrid-services-user-sidepanel-helper.service';

export default angular
  .module('hercules.hybrid-calendar-service-user-settings', [
    calendarCloudConnectorModuleName,
    hybridServicesClusterServiceModuleName,
    hybridServiceUserSidepanelHelperServiceModuleName,
  ])
  .component('hybridCalendarServiceUserSettings', new HybridCalendarServiceUserSettingsComponent())
  .name;
