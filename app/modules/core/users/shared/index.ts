export * from './onboard.interfaces';

import { AutoAssignTemplateService } from './auto-assign-template.service';
import crUsersErrorResultsModuleName from './cr-users-error-results';
import crUsersTileTotalsModuleName from './cr-users-tile-totals';
import * as authinfoModuleName from 'modules/core/scripts/services/authinfo';
import * as urlConfigModuleName from 'modules/core/config/urlConfig';
import crCheckboxItemModuleName from './cr-checkbox-item';
import crCollapsibleRowModuleName from './cr-collapsible-row';

export default angular.module('core.users.shared', [
  require('angular-translate'),
  require('collab-ui-ng').default,
  authinfoModuleName,
  crUsersErrorResultsModuleName,
  crUsersTileTotalsModuleName,
  urlConfigModuleName,
  crCheckboxItemModuleName,
  crCollapsibleRowModuleName,
])
  .service('AutoAssignTemplateService', AutoAssignTemplateService)
  .name;
