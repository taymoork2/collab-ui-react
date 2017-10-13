import { CacheWarmUpService } from './cache-warm-up.service';

export default angular
  .module('core.cache', [
    require('modules/core/scripts/services/authinfo'),
    require('modules/core/config/urlConfig'),
  ])
  .service('CacheWarmUpService', CacheWarmUpService)
  .name;
