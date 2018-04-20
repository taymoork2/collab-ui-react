import configModuleName from 'modules/core/config/config';
import * as urlConfigModuleName from 'modules/core/config/urlConfig';
import * as ngTranslateModuleName from 'angular-translate';

import { mockData } from './mock-data';
import * as LicenseService from 'modules/squared/helpdesk/license.service';  // TODO: allow JS module resolution for relative import
import * as HelpdeskExtendedInfoDialogController from 'modules/squared/helpdesk/helpdesk-extended-info-dialog.controller.js';

export default angular
  .module('squared.helpdesk', [
    configModuleName,
    ngTranslateModuleName,
    urlConfigModuleName,
  ])
  .constant('HelpdeskMockData', mockData)
  .service('LicenseService', LicenseService)
  .controller('HelpdeskExtendedInfoDialogController', HelpdeskExtendedInfoDialogController)
  .name;
