import './partner-reports.scss';

import featureToggleModuleName from 'modules/core/featureToggle';
import loadEventModuleName from 'modules/core/loadEvent';
import { PartnerReportsSwitchCtrl } from './partnerReportsSwitch.controller';
import { PartnerReportsTabsComponent } from './partnerReportsTabs.component';

export default angular
  .module('core.partner-reports', [
    require('modules/core/analytics'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/core/config/config').default,
    require('modules/core/notifications').default,
    featureToggleModuleName,
    loadEventModuleName,
  ])
  .controller('PartnerReportsSwitchCtrl', PartnerReportsSwitchCtrl)
  .component('partnerReportsTabs', new PartnerReportsTabsComponent())
  .name;
