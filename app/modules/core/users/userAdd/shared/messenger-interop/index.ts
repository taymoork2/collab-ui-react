import MessengerInteropService from './messenger-interop.service';

import * as authinfoModuleName from 'modules/core/scripts/services/authinfo';
import configModuleName from 'modules/core/config/config';

export default angular.module('core.users.userAdd.shared.messenger-interop', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  authinfoModuleName,
  configModuleName,
])
  .service('MessengerInteropService', MessengerInteropService)
  .name;
