import * as HttpStatus from 'http-status-codes';
import { MetricsService, OperationalKey } from 'modules/core/metrics';

interface IRetryHttpConfig extends ng.IRequestConfig {
  retryConfig: RetryConfig;
}

enum RetryState {
  FAIL = 'fail',
  RETRY = 'retry',
  SUCCESS = 'success',
}

class RetryConfig {
  public baseMultiplier = 1;
  public delayInMillis = 0;
  public isLastRetry = false;
  public origHttpStatus: number;
}

export class RateLimitService {
  private readonly MIN_DELAY = 100; // 100ms
  private readonly MAX_DELAY = 15000; // 15s
  private readonly FACTOR = 2;
  private readonly HAS_JITTER = true;

  private readonly RETRY_AFTER_HEADER = 'Retry-After';

  private readonly THROTTLED_STATUS_CODES = [
    HttpStatus.TOO_MANY_REQUESTS,
    HttpStatus.SERVICE_UNAVAILABLE,
  ];

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private $q: ng.IQService,
    private $timeout: ng.ITimeoutService,
    private MetricsService: MetricsService,
  ) {}

  public hasBeenThrottled(response): boolean {
    return _.includes(this.THROTTLED_STATUS_CODES, _.get(response, 'status'));
  }

  public retryThrottledResponse<T>(response: ng.IHttpResponse<T>) {
    const config = _.get<IRetryHttpConfig>(response, 'config');
    if (!config) {
      return this.$q.reject(response);
    }
    if (!config.retryConfig) {
      config.retryConfig = new RetryConfig();
    }
    config.retryConfig.origHttpStatus = response.status;
    if (config.retryConfig.isLastRetry) {
      return this.$q.reject(response);
    }
    const retryAfterValue = _.isFunction(response.headers) && response.headers(this.RETRY_AFTER_HEADER);
    return this.retryExponentialBackoff<T>(config, _.toNumber(retryAfterValue));
  }

  public trackMetric(response: ng.IHttpResponse<any>) {
    const config = _.get<IRetryHttpConfig>(response, 'config');
    if (!this.hasRetryConfig(config)) {
      return;
    }

    let state: RetryState;
    if (this.hasBeenThrottled(response)) {
      if (config.retryConfig.isLastRetry) {
        state = RetryState.FAIL;
      } else {
        state = RetryState.RETRY;
      }
    } else {
      state = RetryState.SUCCESS;
    }

    this.MetricsService.trackOperationalMetric(OperationalKey.RATE_LIMIT_RETRY, {
      delay_in_millis: config.retryConfig.delayInMillis,
      orig_http_status: config.retryConfig.origHttpStatus,
      request_method: config.method,
      request_url: config.url,
      state,
      tracking_id: _.isFunction(config.headers) ? config.headers('TrackingID') : undefined,
    });
  }

  private retryExponentialBackoff<T>(config: IRetryHttpConfig, retryAfterInSeconds: number) {
    const retryAfterInMillis = _.isNaN(retryAfterInSeconds) ? 0 : retryAfterInSeconds * 1000;
    config.retryConfig.delayInMillis = this.calculateBackoffDelay(config, retryAfterInMillis);
    config.retryConfig.isLastRetry = config.retryConfig.delayInMillis >= this.MAX_DELAY;
    return this.delayHttpRequest<T>(config, config.retryConfig.delayInMillis);
  }

  private calculateBackoffDelay(config: IRetryHttpConfig, retryAfterInMillis: number) {
    // jitter background: https://www.awsarchitectureblog.com/2015/03/backoff.html
    const randomMultiplier = this.HAS_JITTER ? Math.random() + 1 : 1;
    const calculatedBackoff = Math.round(this.MIN_DELAY * randomMultiplier * config.retryConfig.baseMultiplier);
    config.retryConfig.baseMultiplier *= this.FACTOR;
    if (calculatedBackoff >= retryAfterInMillis) {
      return Math.min(this.MAX_DELAY, calculatedBackoff);
    } else {
      return this.calculateBackoffDelay(config, retryAfterInMillis);
    }
  }

  private delayHttpRequest<T>(config: ng.IRequestConfig, delayInMillis: number) {
    return this.$timeout(() => this.$http<T>(config), delayInMillis);
  }

  private hasRetryConfig(config: IRetryHttpConfig) {
    return _.has(config, 'retryConfig');
  }
}
