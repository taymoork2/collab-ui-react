import './hybrid-services-entitlements-panel.scss';

import { HybridServicesEntitlementsPanelComponent } from './hybrid-services-entitlements-panel.component';
import calendarCloudConnectorServiceModuleName from 'modules/hercules/services/calendar-cloud-connector.service';
import featureToggleModuleName from 'modules/core/featureToggle';
import onboardModuleName from 'modules/core/users/shared/onboard';
import serviceDescriptorModuleName from 'modules/hercules/services/service-descriptor.service';

export default angular.module('core.users.userAdd.hybrid-services-entitlements-panel', [
  calendarCloudConnectorServiceModuleName,
  featureToggleModuleName,
  onboardModuleName,
  serviceDescriptorModuleName,
])
  .component('hybridServicesEntitlementsPanel', new HybridServicesEntitlementsPanelComponent())
  .name;
