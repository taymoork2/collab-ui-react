import { HealthService } from './health.service';

export * from './health.keys';

export default angular
  .module('core.health-monitor', [
    require('modules/core/config/urlConfig'),
  ])
  .service('HealthService', HealthService)
  .name;
