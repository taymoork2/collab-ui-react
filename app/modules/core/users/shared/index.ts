export * from './onboard.interfaces';

import { AutoAssignTemplateModel } from './auto-assign-template.model';
import { AutoAssignTemplateService } from './auto-assign-template.service';
import crUsersErrorResultsModuleName from './cr-users-error-results';
import crUsersTileTotalsModuleName from './cr-users-tile-totals';
import * as authinfoModuleName from 'modules/core/scripts/services/authinfo';
import * as urlConfigModuleName from 'modules/core/config/urlConfig';
import * as orgServiceModuleName from 'modules/core/scripts/services/org.service';
import crCheckboxItemModuleName from './cr-checkbox-item';
import crCollapsibleRowModuleName from './cr-collapsible-row';

export default angular.module('core.users.shared', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  authinfoModuleName,
  crUsersErrorResultsModuleName,
  crUsersTileTotalsModuleName,
  urlConfigModuleName,
  orgServiceModuleName,
  crCheckboxItemModuleName,
  crCollapsibleRowModuleName,
])
  .service('AutoAssignTemplateModel', AutoAssignTemplateModel)
  .service('AutoAssignTemplateService', AutoAssignTemplateService)
  .name;
