import { RateLimitService } from './rate-limit.service';

export class RateLimitInterceptor implements ng.IHttpInterceptor {

  /* @ngInject */
  constructor(
    private $injector,
    private $q: ng.IQService,
  ) {}

  // property method required for interceptor
  public response = (response) => {
    const RateLimitService = this.getRateLimitService();

    RateLimitService.trackMetric(response);

    return response;
  }

  // property method required for interceptor
  public responseError = <T>(response): ng.IPromise<ng.IHttpResponse<T>> => {
    const RateLimitService = this.getRateLimitService();

    RateLimitService.trackMetric(response);

    if (RateLimitService.hasBeenThrottled(response)) {
      return RateLimitService.retryThrottledResponse<T>(response);
    }

    return this.$q.reject(response);
  }

  private getRateLimitService(): RateLimitService {
    return this.$injector.get('RateLimitService');
  }
}
