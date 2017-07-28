import { CacheWarmUpService } from './cache-warm-up.service';

export default angular
  .module('core.cache', [])
  .service('CacheWarmUpService', CacheWarmUpService)
  .name;
