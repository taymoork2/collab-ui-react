import 'usertiming'; // polyfill for performance methods - https://developer.mozilla.org/en-US/docs/Web/API/Performance
import 'babel-polyfill';
import '@ciscospark/internal-plugin-metrics';
import '@ciscospark/plugin-logger';
import Spark from '@ciscospark/spark-core';

import { Config } from 'modules/core/config/config';

import {
  DiagnosticKey,
  OperationalKey,
  TimingKey,
} from './metrics.keys';

import {
  PerformanceType,
  TimingMetric,
  timingMetrics,
} from './timing-metrics';

enum Env {
  PROD = 'PROD',
  TEST = 'TEST',
}

enum MetricType {
  BEHAVIORAL = 'behavioral',
  OPERATIONAL = 'operational',
}

export class MetricsService {
  private static readonly APP_TYPE = 'Atlas';
  private static readonly LOG_LEVEL = 'error';
  private static readonly TRACKING_PREFIX = 'ATLAS';
  private readonly timingMetrics = timingMetrics;
  private queuedMetrics: Function[] = [];
  private fakeSdk = {
    submit: (...args) => {
      this.queuedMetrics.push(() => this.sdk.submit(...args));
      return this.$q.resolve();
    },
    submitClientMetrics: (...args) => {
      this.queuedMetrics.push(() => this.sdk.submitClientMetrics(...args));
      return this.$q.resolve();
    },
  };
  private spark;

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $timeout: ng.ITimeoutService,
    private $window: ng.IWindowService,
    private Auth,
    private Config: Config,
    private TokenService,
  ) {}

  public trackDiagnosticMetric(key: DiagnosticKey, props: Object) {
    this.sendToSplunk(key, props);
  }

  public trackDiagnosticMetricAndThrow(key: DiagnosticKey, props: Object) {
    this.trackDiagnosticMetric(key, props);
    throw new Error(`Diagnostic Metric: ${key}`); // key reported to New Relic
  }

  public trackOperationalMetric(key: OperationalKey, props: Object = {}) {
    this.sendToInflux(key, props);
  }

  public startTimer(key: TimingKey) {
    const metric = this.getMetricByKey(key);
    if (!metric) {
      return;
    }

    if (metric.markStart && this.isNotPerformanceTimingKey(metric.markStart)) {
      this.mark(metric.markStart);
    }
  }

  public stopTimer(key: TimingKey, props?: Object) {
    const metric = this.getMetricByKey(key);
    if (!metric) {
      return;
    }

    if (metric.markStop && this.isNotPerformanceTimingKey(metric.markStop)) {
      this.mark(metric.markStop);
    }
    this.measure(metric);
    this.reportMeasurement(metric, props);
    this.cleanup(metric);
  }

  public reportLoadingMetrics() {
    if (typeof this.$window.performance.timing === 'undefined') {
      return;
    }

    if (this.hasInvalidTimingValue(this.$window.performance.timing)) {
      return;
    }

    const loadMetric = {
      dom_duration_in_millis: this.$window.performance.timing.loadEventEnd - this.$window.performance.timing.responseEnd,
      navigation_duration_in_millis: this.$window.performance.timing.fetchStart - this.$window.performance.timing.navigationStart,
      network_duration_in_millis: this.$window.performance.timing.responseEnd - this.$window.performance.timing.fetchStart,
      total_duration_in_millis: this.$window.performance.timing.loadEventEnd - this.$window.performance.timing.navigationStart,
    };

    if (this.hasInvalidTimingValue(loadMetric)) {
      return;
    }

    this.sendToInflux(TimingKey.LOAD_DURATION, loadMetric);
  }

  public addTimingMetric(metric: TimingMetric) {
    this.timingMetrics.push(metric);
  }

  // TODO create interface for sdk
  private get sdk() {
    if (!this.spark) {
      if (!this.TokenService.getAccessToken()) {
        // If not authenticated, queue up metrics for after authentication
        // TODO: Do we want to use /clientmetrics-prelogin
        return this.fakeSdk;
      }

      this.spark = this.initSparkSdk();

      this.$timeout(() => {
        while (this.queuedMetrics.length) {
          const queuedMetricFn = this.queuedMetrics.shift()!;
          queuedMetricFn();
        }
      });
    }
    return this.spark.internal.metrics;
  }

  private initSparkSdk() {
    return new Spark({
      config: {
        credentials: {
          refreshCallback: () => this.Auth.refreshAccessToken().then(access_token => ({ access_token })),
        },
        logger: {
          level: MetricsService.LOG_LEVEL,
        },
        trackingIdPrefix: MetricsService.TRACKING_PREFIX,
      },
      credentials: {
        access_token: this.TokenService.getAccessToken(),
        refresh_token: this.TokenService.getRefreshToken(),
      },
    });
  }

  private sendToSplunk(key: string, props: Object) {
    if (!this.isProd()) {
      return;
    }
    const metric = this.transformSplunkPayload(props);
    return this.sdk.submit(key, metric);
  }

  private sendToInflux(key: string, props: Object, type: MetricType | MetricType[] = MetricType.OPERATIONAL) {
    if (!this.isProd()) {
      return;
    }
    const metric = this.transformInfluxPayload(props, _.isArray(type) ? type : [type]);
    return this.sdk.submitClientMetrics(key, metric);
  }

  private transformSplunkPayload(valueObj) {
    return {
      appType: MetricsService.APP_TYPE,
      env: this.isProd() ? Env.PROD : Env.TEST,
      value: _.isObjectLike(valueObj) ? valueObj : {},
    };
  }

  private transformInfluxPayload(props: Object, type: MetricType[]) {
    const fields = {};
    const tags = {};
    _.forEach(props, (value, key) => {
      if (typeof key === 'undefined') {
        return;
      }

      const valueType = typeof value;
      switch (valueType) {
        case 'boolean':
        case 'string':
        case 'undefined':
          tags[key] = value;
          break;
        case 'number':
          fields[key] = value;
          break;
        default:
          throw new Error(`Unable to tranform metric payload ${key} type ${valueType}`);
      }
    });

    return {
      fields,
      tags,
      type,
    };
  }

  private isProd(): boolean {
    return this.Config.isProd() && !this.Config.isE2E();
  }

  private reportMeasurement(metric: TimingMetric, props?: Object) {
    if (typeof this.$window.performance.getEntriesByName === 'undefined') {
      return;
    }

    const measurements = this.$window.performance.getEntriesByName(metric.measure, PerformanceType.MEASURE) as PerformanceMeasure[];
    if (measurements.length) {
      const measurement = _.last(measurements);
      if (measurement.duration >= 0) {
        const durationMetric = _.assign({
          duration_in_millis: measurement.duration,
        }, props);

        this.sendToInflux(metric.key, durationMetric);
      }
    }
  }

  private getMetricByKey(key: TimingKey): TimingMetric | undefined {
    return _.find(this.timingMetrics, {
      key,
    });
  }

  private isNotPerformanceTimingKey(key: string) {
    if (typeof PerformanceTiming === 'undefined') {
      return true;
    }

    return !PerformanceTiming.prototype.hasOwnProperty(key);
  }

  private mark(key: string) {
    if (typeof this.$window.performance.mark === 'undefined') {
      return;
    }

    this.$window.performance.mark(key);
  }

  private measure(metric: TimingMetric) {
    if (typeof this.$window.performance.measure === 'undefined') {
      return;
    }

    this.$window.performance.measure(metric.measure, metric.markStart, metric.markStop);
  }

  private cleanup(metric: TimingMetric) {
    if (metric.isOneTime) {
      _.remove(this.timingMetrics, metric);
    }

    if (typeof this.$window.performance.clearMarks === 'undefined' || typeof this.$window.performance.clearMeasures === 'undefined') {
      return;
    }

    this.$window.performance.clearMarks(metric.markStart);
    this.$window.performance.clearMarks(metric.markStop);
    this.$window.performance.clearMeasures(metric.measure);
  }

  private hasInvalidTimingValue(obj: Object) {
    return _.some(obj, value => !_.isFinite(value) || value < 0);
  }

}
