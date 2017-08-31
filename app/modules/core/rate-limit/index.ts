import metricsModule from 'modules/core/metrics';

import { RateLimitService } from './rate-limit.service';
import { RateLimitInterceptor } from './rate-limit.interceptor';

export default angular.module('core.rate-limit', [
  metricsModule,
])
  .service('RateLimitInterceptor', RateLimitInterceptor)
  .service('RateLimitService', RateLimitService)
  .config(($httpProvider: ng.IHttpProvider) => {
    $httpProvider.interceptors.push('RateLimitInterceptor');
  })
  .name;
