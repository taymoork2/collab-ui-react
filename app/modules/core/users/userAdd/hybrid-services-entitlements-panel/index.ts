import { hybridServicesPanel, hybridServicesPanelCtrl } from 'modules/core/users/userAdd/hybrid-services-entitlements-panel/hybridServicesPanel.directive.js';
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
  .directive('hybridServicesPanel', hybridServicesPanel)
  .controller('hybridServicesPanelCtrl', hybridServicesPanelCtrl)
  .name;
