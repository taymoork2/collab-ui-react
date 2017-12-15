import * as authinfoModuleName from 'modules/core/scripts/services/authinfo';
import configModuleName from 'modules/core/config/config';
import MessengerInteropService from './messenger-interop.service';
import OnboardService from './onboard.service';

export default angular.module('modules.core.users.userAdd.shared', [
  authinfoModuleName,
  configModuleName,
])
  .service('OnboardService', OnboardService)
  .service('MessengerInteropService', MessengerInteropService)
  .name;
