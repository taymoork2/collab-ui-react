import metricsModule from './index';

import {
  MarkKey,
  MeasureKey,
  TimingKey,
} from './metrics.keys';

import {
  TimingMetric,
} from './timing-metrics';

describe('Metrics:', () => {
  beforeEach(function () {
    this.initModules(metricsModule);
    this.injectDependencies(
      '$timeout',
      '$window',
      'Config',
      'MetricsService',
      'TokenService',
    );

    spyOn(this.TokenService, 'getAccessToken');
    spyOn(this.TokenService, 'getRefreshToken');
    spyOn(this.Config, 'isProd');
    spyOn(this.Config, 'isE2E');
  });

  describe('Not In Prod', () => {
    beforeEach(function () {
      this.Config.isProd.and.returnValue(false);
      spyOn(this.MetricsService.sdk, 'submit');
      spyOn(this.MetricsService.sdk, 'submitClientMetrics');
    });

    it('should not fire metrics', function () {
      this.MetricsService.trackDiagnosticMetric('diagnostic-metric', {
        dummy: 'data',
      });

      expect(this.MetricsService.sdk.submit).not.toHaveBeenCalled();
      expect(this.MetricsService.sdk.submitClientMetrics).not.toHaveBeenCalled();
    });

  });

  describe('In Prod', () => {
    beforeEach(function () {
      this.Config.isProd.and.returnValue(true);
      this.Config.isE2E.and.returnValue(false);
    });

    describe('Before Authentication', () => {
      beforeEach(function () {
        this.TokenService.getAccessToken.and.returnValue('');
      });

      it('should use fake sdk', function () {
        expect(this.MetricsService.sdk.submit).toEqual(jasmine.any(Function));
        expect(this.MetricsService.sdk.submitClientMetrics).toEqual(jasmine.any(Function));
        expect(this.MetricsService.spark).toBeUndefined();
      });

      describe('Queue Functionality', () => {
        beforeEach(function () {
          spyOn(this.MetricsService.sdk, 'submit').and.callThrough();
          spyOn(this.MetricsService.sdk, 'submitClientMetrics').and.callThrough();
        });

        it('should queue up a metrics to fire after authentication', function () {
          this.MetricsService.trackDiagnosticMetric('diagnostic-metric', {
            dummy: 'data',
          });
          this.MetricsService.trackOperationalMetric('operational-metric', {
            dummy: 'data',
            value: 1,
          });
          expect(this.MetricsService.spark).toBeUndefined();
          expect(this.MetricsService.sdk.submit).toHaveBeenCalled();
          expect(this.MetricsService.sdk.submitClientMetrics).toHaveBeenCalled();
          expect(this.MetricsService.queuedMetrics.length).toBe(2);

          this.TokenService.getAccessToken.and.returnValue('fake-token');
          spyOn(this.MetricsService.sdk, 'submit'); // initializes spark sdk and then stubs
          spyOn(this.MetricsService.sdk, 'submitClientMetrics'); // initializes spark sdk and then stubs
          expect(this.MetricsService.spark).toBeDefined();
          expect(this.MetricsService.sdk.submit).not.toHaveBeenCalled();
          expect(this.MetricsService.sdk.submitClientMetrics).not.toHaveBeenCalled();

          this.$timeout.flush();
          expect(this.MetricsService.sdk.submit).toHaveBeenCalledWith('diagnostic-metric', {
            appType: 'Atlas',
            env: 'PROD',
            value: {
              dummy: 'data',
            },
          });
          expect(this.MetricsService.sdk.submitClientMetrics).toHaveBeenCalledWith('operational-metric', {
            type: ['operational'],
            fields: {
              value: 1,
            },
            tags: {
              dummy: 'data',
            },
          });
          expect(this.MetricsService.queuedMetrics.length).toBe(0);
        });
      });
    });

    describe('After Authentication', () => {
      beforeEach(function () {
        this.TokenService.getAccessToken.and.returnValue('fake-token');
      });

      it('should initialize spark sdk', function () {
        expect(this.MetricsService.sdk.submit).toEqual(jasmine.any(Function));
        expect(this.MetricsService.sdk.submitClientMetrics).toEqual(jasmine.any(Function));
        expect(this.MetricsService.spark).toBeDefined();
      });

      describe('Diagnostic Metrics Functionality', () => {
        beforeEach(function () {
          spyOn(this.MetricsService.sdk, 'submit');
          spyOn(this.MetricsService.sdk, 'submitClientMetrics');
        });

        it('should submit a metric', function () {
          this.MetricsService.trackDiagnosticMetric('diagnostic-metric', {
            dummy: 'data',
          });
          expect(this.MetricsService.sdk.submit).toHaveBeenCalledWith('diagnostic-metric', {
            appType: 'Atlas',
            env: 'PROD',
            value: {
              dummy: 'data',
            },
          });
          expect(this.MetricsService.sdk.submitClientMetrics).not.toHaveBeenCalled();
        });
      });

      describe('Operational Metrics Functionality', () => {
        beforeEach(function () {
          spyOn(this.MetricsService.sdk, 'submit');
          spyOn(this.MetricsService.sdk, 'submitClientMetrics');
        });

        it('should submit a metric', function () {
          this.MetricsService.trackOperationalMetric('operational-metric', {
            dummy: 'data',
            value: 1,
          });
          expect(this.MetricsService.sdk.submitClientMetrics).toHaveBeenCalledWith('operational-metric', {
            type: ['operational'],
            fields: {
              value: 1,
            },
            tags: {
              dummy: 'data',
            },
          });
          expect(this.MetricsService.sdk.submit).not.toHaveBeenCalled();
        });
      });

      describe('Timing Metrics Functionality', () => {
        beforeEach(function () {
          spyOn(this.MetricsService.sdk, 'submit');
          spyOn(this.MetricsService.sdk, 'submitClientMetrics');

          this.MetricsService.addTimingMetric(new TimingMetric({
            key: 'test-key' as TimingKey,
            measure: 'test-measure' as MeasureKey,
            markStart: 'test-mark-start' as MarkKey,
            markStop: 'test-mark-stop' as MarkKey,
          }));

          this.MetricsService.addTimingMetric(new TimingMetric({
            key: 'one-time-test-key' as TimingKey,
            measure: 'one-time-test-measure' as MeasureKey,
            markStart: 'one-time-test-mark-start' as MarkKey,
            markStop: 'one-time-test-mark-stop' as MarkKey,
            isOneTime: true,
          }));

          jasmine.clock().install();
          jasmine.clock().mockDate();

          this.originalPerformance = this.$window.performance;
          this.performanceCache = {};
          this.$window.performance = {
            mark: (key) => this.performanceCache[key] = new Date().getTime(), // Date.now(),
            measure: (key, markStart, markStop) => {
              this.performanceCache[key] = {
                duration: this.performanceCache[markStop] - this.performanceCache[markStart],
              };
            },
            getEntriesByName: (key) => [this.performanceCache[key]],
            clearMarks: (key) => delete this.performanceCache[key],
            clearMeasures: (key) => delete this.performanceCache[key],
            timing: {
              navigationStart: 0,
              fetchStart: 100,
              responseEnd: 1000,
              loadEventEnd: 2000,
            } as PerformanceTiming,
          } as any;
        });

        afterEach(function () {
          this.$window.performance = this.originalPerformance;
          jasmine.clock().uninstall();
        });

        it('should submit a timing metric multiple times', function () {
          this.MetricsService.startTimer('test-key');
          jasmine.clock().tick(5000);

          this.MetricsService.stopTimer('test-key', {
            additionalField: 1,
            additionalTag: true,
          });
          expect(this.MetricsService.sdk.submitClientMetrics).toHaveBeenCalledWith('test-key', {
            type: ['operational'],
            fields: {
              duration_in_millis: 5000,
              additionalField: 1,
            },
            tags: {
              additionalTag: true,
            },
          });
          expect(this.MetricsService.sdk.submit).not.toHaveBeenCalled();

          this.MetricsService.sdk.submitClientMetrics.calls.reset();

          this.MetricsService.startTimer('test-key');
          jasmine.clock().tick(1000);

          this.MetricsService.stopTimer('test-key', {
            additionalField: 2,
            additionalTag: false,
          });
          expect(this.MetricsService.sdk.submitClientMetrics).toHaveBeenCalledWith('test-key', {
            type: ['operational'],
            fields: {
              duration_in_millis: 1000,
              additionalField: 2,
            },
            tags: {
              additionalTag: false,
            },
          });
          expect(this.MetricsService.sdk.submit).not.toHaveBeenCalled();
        });

        it('should submit a one-time timing metric only once', function () {
          this.MetricsService.startTimer('one-time-test-key');
          jasmine.clock().tick(2000);

          this.MetricsService.stopTimer('one-time-test-key');
          expect(this.MetricsService.sdk.submitClientMetrics).toHaveBeenCalledWith('one-time-test-key', {
            type: ['operational'],
            fields: {
              duration_in_millis: 2000,
            },
            tags: {},
          });
          expect(this.MetricsService.sdk.submit).not.toHaveBeenCalled();

          this.MetricsService.sdk.submitClientMetrics.calls.reset();

          this.MetricsService.startTimer('one-time-test-key');
          jasmine.clock().tick(3000);

          this.MetricsService.stopTimer('one-time-test-key');
          expect(this.MetricsService.sdk.submitClientMetrics).not.toHaveBeenCalled();
          expect(this.MetricsService.sdk.submit).not.toHaveBeenCalled();
        });

        it('should calculate load timing metric', function () {
          this.MetricsService.reportLoadingMetrics();
          expect(this.MetricsService.sdk.submitClientMetrics).toHaveBeenCalledWith(TimingKey.LOAD_DURATION, {
            type: ['operational'],
            fields: {
              dom_duration_in_millis: 1000,
              navigation_duration_in_millis: 100,
              network_duration_in_millis: 900,
              total_duration_in_millis: 2000,
            },
            tags: {},
          });
          expect(this.MetricsService.sdk.submit).not.toHaveBeenCalled();
        });

        it('should not submit metric if loading metrics have negative calculations from invalid data', function () {
          const origLoadEventEnd = this.$window.performance.timing.loadEventEnd;
          this.$window.performance.timing.loadEventEnd = 0;

          this.MetricsService.reportLoadingMetrics();
          expect(this.MetricsService.sdk.submitClientMetrics).not.toHaveBeenCalled();
          expect(this.MetricsService.sdk.submit).not.toHaveBeenCalled();

          this.$window.performance.timing.loadEventEnd = NaN;

          this.MetricsService.reportLoadingMetrics();
          expect(this.MetricsService.sdk.submitClientMetrics).not.toHaveBeenCalled();
          expect(this.MetricsService.sdk.submit).not.toHaveBeenCalled();

          this.$window.performance.timing.loadEventEnd = origLoadEventEnd;

          this.MetricsService.reportLoadingMetrics();
          expect(this.MetricsService.sdk.submitClientMetrics).toHaveBeenCalledWith(TimingKey.LOAD_DURATION, {
            type: ['operational'],
            fields: {
              dom_duration_in_millis: 1000,
              navigation_duration_in_millis: 100,
              network_duration_in_millis: 900,
              total_duration_in_millis: 2000,
            },
            tags: {},
          });
          expect(this.MetricsService.sdk.submit).not.toHaveBeenCalled();
        });
      });
    });
  });
});
