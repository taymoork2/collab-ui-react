import crUsersErrorResultsModuleName from './cr-users-error-results';
import crUsersTileTotalsModuleName from './cr-users-tile-totals';
import crCollapsibleRowModuleName from './cr-collapsible-row';
import autoAssignTemplateModuleName from './auto-assign-template';
import onboardModuleName from './onboard';
import crActionCardsModuleName from './cr-action-cards';

export default angular.module('core.users.shared', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  crUsersErrorResultsModuleName,
  crUsersTileTotalsModuleName,
  crCollapsibleRowModuleName,
  autoAssignTemplateModuleName,
  onboardModuleName,
  crActionCardsModuleName,
]).name;
