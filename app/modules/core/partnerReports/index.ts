import './partner-reports.scss';

import FeatureToggleService from 'modules/core/featureToggle';
import { PartnerReportsSwitchCtrl } from './partnerReportsSwitch.controller';

export default angular
  .module('core.partner-reports', [
    require('modules/core/analytics'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/core/config/config').default,
    require('modules/core/notifications').default,
    FeatureToggleService,
  ])
  .controller('PartnerReportsSwitchCtrl', PartnerReportsSwitchCtrl)
  .name;
