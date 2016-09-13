import { OnlineAnalyticsService } from './analytics.service';

export * from './analytics.service';

export default angular
  .module('online.analytics', [
    require('modules/core/config/config'),
    require('modules/core/scripts/services/authinfo'),
  ])
  .service('OnlineAnalyticsService', OnlineAnalyticsService)
  .name;
