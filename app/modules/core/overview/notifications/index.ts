import { OverviewAutoAssignNotificationFactory } from './autoAssign.factory';

import autoAssignTemplateModuleName from 'modules/core/users/shared/auto-assign-template';

export default angular.module('core.overview.notifications', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  autoAssignTemplateModuleName,
])
  .factory('OverviewAutoAssignNotificationFactory', OverviewAutoAssignNotificationFactory)
  .name;
