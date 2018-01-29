import * as analyticsModuleName from 'modules/core/analytics';
import * as logMetricsServiceModuleName from 'modules/core/scripts/services/logmetricsservice';
import * as userServiceModuleName from 'modules/core/scripts/services/user.service';
import * as userCsvServiceModuleName from 'modules/core/users/userCsv/userCsv.service';
import OnboardService from './onboard.service';
import OnboardStore from './onboard.store';
import messengerInteropModuleName from './messenger-interop';

export default angular.module('modules.core.users.userAdd.shared', [
  analyticsModuleName,
  logMetricsServiceModuleName,
  userCsvServiceModuleName,
  userServiceModuleName,
  messengerInteropModuleName,
])
  .service('OnboardService', OnboardService)
  .service('OnboardStore', OnboardStore)
  .name;
