import './hybrid-services-entitlements-panel.scss';

import { HybridServicesEntitlementsPanelComponent } from './hybrid-services-entitlements-panel.component';
import calendarCloudConnectorServiceModuleName from 'modules/hercules/services/calendar-cloud-connector.service';
import featureToggleModuleName from 'modules/core/featureToggle';
import serviceDescriptorModuleName from 'modules/hercules/services/service-descriptor.service';
import userAddSharedModuleName from 'modules/core/users/userAdd/shared';

export default angular.module('core.users.userAdd.hybrid-services-entitlements-panel', [
  calendarCloudConnectorServiceModuleName,
  featureToggleModuleName,
  serviceDescriptorModuleName,
  userAddSharedModuleName,
])
  .component('hybridServicesEntitlementsPanel', new HybridServicesEntitlementsPanelComponent())
  .name;
