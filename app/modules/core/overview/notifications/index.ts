import { OverviewAutoAssignNotificationFactory } from './autoAssign.factory';

export default angular.module('core.overview.notifications', [
  require('angular-translate'),
  require('collab-ui-ng').default,
])
  .factory('OverviewAutoAssignNotificationFactory', OverviewAutoAssignNotificationFactory)
  .name;
