import * as authinfoModuleName from 'modules/core/scripts/services/authinfo';
import configModuleName from 'modules/core/config/config';
import MessengerInteropService from './messenger-interop.service';
import OnboardService from './onboard.service';
import OnboardStore from './onboard.store';

export default angular.module('modules.core.users.userAdd.shared', [
  authinfoModuleName,
  configModuleName,
])
  .service('OnboardService', OnboardService)
  .service('OnboardStore', OnboardStore)
  .service('MessengerInteropService', MessengerInteropService)
  .name;
