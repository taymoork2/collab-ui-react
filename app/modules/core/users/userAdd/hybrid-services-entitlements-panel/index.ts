import { hybridServicesEntitlementsPanelCtrl } from 'modules/core/users/userAdd/hybrid-services-entitlements-panel/hybrid-services-entitlements-panel.component.js';
import userAddModuleName from 'modules/core/users/userAdd';
import serviceDescriptorModuleName from 'modules/hercules/services/service-descriptor.service';
import calendarCloudConnectorServiceModuleName from 'modules/hercules/services/calendar-cloud-connector.service';
import featureToggleModuleName from 'modules/core/featureToggle';

export default angular.module('core.users.userAdd.hybrid-services-entitlements', [
  userAddModuleName,
  serviceDescriptorModuleName,
  calendarCloudConnectorServiceModuleName,
  featureToggleModuleName,
])
  .component('hybridServicesEntitlementsPanel', {
    bindings: {
      entitlementsCallback: '&',
      userIsLicensed: '<',
    },
    controller: hybridServicesEntitlementsPanelCtrl,
    template: require('./hybrid-services-entitlements-panel.html'),
  })
  .name;
