import './helpdesk.scss';
import configModuleName from 'modules/core/config/config';
import * as urlConfigModuleName from 'modules/core/config/urlConfig';
import * as ngTranslateModuleName from 'angular-translate';
import helpdeskAdminElevationModule from './admin-elevation';

import { mockData } from './mock-data';
import * as LicenseService from 'modules/squared/helpdesk/license.service';  // TODO: allow JS module resolution for relative import
import * as HelpdeskExtendedInfoDialogController from 'modules/squared/helpdesk/helpdesk-extended-info-dialog.controller.js';

export default angular
  .module('squared.helpdesk', [
    configModuleName,
    ngTranslateModuleName,
    urlConfigModuleName,
    helpdeskAdminElevationModule,
  ])
  .constant('HelpdeskMockData', mockData)
  .service('LicenseService', LicenseService)
  .controller('HelpdeskExtendedInfoDialogController', HelpdeskExtendedInfoDialogController)
  .name;
