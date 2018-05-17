import featureToggleModuleName from 'modules/core/featureToggle';
import loadEventModuleName from 'modules/core/loadEvent';
import { PartnerReportsTabsComponent } from './partnerReportsTabs.component';
import { ReportsRedirectController } from './reportsRedirect.controller';

export default angular
  .module('core.partner-reports', [
    require('modules/core/analytics'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/core/auth/auth'),
    require('modules/core/config/config').default,
    require('modules/core/notifications').default,
    featureToggleModuleName,
    loadEventModuleName,
  ])
  .component('partnerReportsTabs', new PartnerReportsTabsComponent())
  .controller('ReportsRedirectCtrl', ReportsRedirectController)
  .name;
