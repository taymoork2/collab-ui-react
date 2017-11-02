export * from './onboard.interfaces';

import { AutoAssignTemplateService } from './auto-assign-template.service';
import crUsersTileTotalsModuleName from './cr-users-tile-totals';
import * as authinfoModuleName from 'modules/core/scripts/services/authinfo';
import * as urlConfigModuleName from 'modules/core/config/urlConfig';

export default angular.module('core.users.shared', [
  require('angular-translate'),
  require('collab-ui-ng').default,
  authinfoModuleName,
  crUsersTileTotalsModuleName,
  urlConfigModuleName,
])
  .service('AutoAssignTemplateService', AutoAssignTemplateService)
  .name;
