export * from './onboard.interfaces';

import crUsersErrorResultsModuleName from './cr-users-error-results';
import crUsersTileTotalsModuleName from './cr-users-tile-totals';
import crCheckboxItemModuleName from './cr-checkbox-item';
import crCollapsibleRowModuleName from './cr-collapsible-row';
import autoAssignTemplateModuleName from './auto-assign-template';

export default angular.module('core.users.shared', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  crUsersErrorResultsModuleName,
  crUsersTileTotalsModuleName,
  crCheckboxItemModuleName,
  crCollapsibleRowModuleName,
  autoAssignTemplateModuleName,
]).name;
