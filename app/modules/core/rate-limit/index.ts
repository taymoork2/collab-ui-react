import { RateLimitService } from './rate-limit.service';

export default angular.module('core.rate-limit', [])
  .service('RateLimitService', RateLimitService)
  .name;
