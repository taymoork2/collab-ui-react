import * as analyticsModuleName from 'modules/core/analytics';
import * as logMetricsServiceModuleName from 'modules/core/scripts/services/logmetricsservice';
import * as userCsvServiceModuleName from 'modules/core/users/userCsv/userCsv.service';
import * as userServiceModuleName from 'modules/core/scripts/services/user.service';
import OnboardService from './onboard.service';
import OnboardStore from './onboard.store';

export default angular.module('modules.core.users.shared.onboard', [
  analyticsModuleName,
  logMetricsServiceModuleName,
  userCsvServiceModuleName,
  userServiceModuleName,
])
  .service('OnboardService', OnboardService)
  .service('OnboardStore', OnboardStore)
  .name;
