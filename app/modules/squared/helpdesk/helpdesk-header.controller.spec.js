'use strict';

var HealthStatusType = require('modules/core/health-monitor').HealthStatusType;

describe('Controller: HelpdeskHeaderController', function () {
  beforeEach(function () {
    this.initModules('Squared');
    this.injectDependencies(
      '$controller',
      '$q',
      '$scope',
      'HealthService',
      'HelpdeskSearchHistoryService',
      'UrlConfig');

    spyOn(this.HelpdeskSearchHistoryService, 'getAllSearches').and.returnValue([]);
    spyOn(this.UrlConfig, 'getStatusPageUrl').and.returnValue('statusPageUrl');
  });

  function initController() {
    this.controller = this.$controller('HelpdeskHeaderController', {
      $scope: this.$scope,
      HelpdeskSearchHistoryService: this.HelpdeskSearchHistoryService,
    });
    this.$scope.$apply();
  }

  // Name Changes
  describe('default nav header title - ', function () {
    it('should be navHeaderTitleNew', function () {
      spyOn(this.HealthService, 'getHealthCheck').and.returnValue(this.$q.resolve({
        components: [{
          name: 'SparkHybrid',
          status: HealthStatusType.OPERATIONAL,
        }],
      }));
      initController.call(this);

      expect(this.controller.pageHeader).toEqual('helpdesk.navHeaderTitleNew');
    });
  });

  // overallSparkStatus
  describe('overallSparkStatus - ', function () {
    it('should be error', function () {
      spyOn(this.HealthService, 'getHealthCheck').and.returnValue(this.$q.resolve({
        components: [{
          status: HealthStatusType.ERROR,
        }, {
          status: HealthStatusType.DEGRADED_PERFORMANCE,
        }, {
          status: HealthStatusType.OPERATIONAL,
        }, {
          status: HealthStatusType.MAJOR_OUTAGE,
        }, {
          status: HealthStatusType.PARTIAL_OUTAGE,
        }, {
          status: HealthStatusType.WARNING,
        }],
      }));
      initController.call(this);
      expect(this.controller.overallSparkStatus).toEqual(HealthStatusType.ERROR);
    });

    it('should be MAJOR_OUTAGE', function () {
      spyOn(this.HealthService, 'getHealthCheck').and.returnValue(this.$q.resolve({
        components: [{
          status: HealthStatusType.DEGRADED_PERFORMANCE,
        }, {
          status: HealthStatusType.OPERATIONAL,
        }, {
          status: HealthStatusType.MAJOR_OUTAGE,
        }, {
          status: HealthStatusType.PARTIAL_OUTAGE,
        }, {
          status: HealthStatusType.WARNING,
        }],
      }));
      initController.call(this);
      expect(this.controller.overallSparkStatus).toEqual(HealthStatusType.MAJOR_OUTAGE);
    });

    it('should be WARNING', function () {
      spyOn(this.HealthService, 'getHealthCheck').and.returnValue(this.$q.resolve({
        components: [{
          status: HealthStatusType.DEGRADED_PERFORMANCE,
        }, {
          status: HealthStatusType.OPERATIONAL,
        }, {
          status: HealthStatusType.PARTIAL_OUTAGE,
        }, {
          status: HealthStatusType.WARNING,
        }],
      }));
      initController.call(this);
      expect(this.controller.overallSparkStatus).toEqual(HealthStatusType.WARNING);
    });

    it('should be PARTIAL_OUTAGE', function () {
      spyOn(this.HealthService, 'getHealthCheck').and.returnValue(this.$q.resolve({
        components: [{
          status: HealthStatusType.DEGRADED_PERFORMANCE,
        }, {
          status: HealthStatusType.OPERATIONAL,
        }, {
          status: HealthStatusType.PARTIAL_OUTAGE,
        }],
      }));
      initController.call(this);
      expect(this.controller.overallSparkStatus).toEqual(HealthStatusType.PARTIAL_OUTAGE);
    });

    it('should be DEGRADED_PERFORMANCE', function () {
      spyOn(this.HealthService, 'getHealthCheck').and.returnValue(this.$q.resolve({
        components: [{
          status: HealthStatusType.DEGRADED_PERFORMANCE,
        }, {
          status: HealthStatusType.OPERATIONAL,
        }],
      }));
      initController.call(this);
      expect(this.controller.overallSparkStatus).toEqual(HealthStatusType.DEGRADED_PERFORMANCE);
    });

    it('should be OPERATIONAL', function () {
      spyOn(this.HealthService, 'getHealthCheck').and.returnValue(this.$q.resolve({
        components: [{
          status: HealthStatusType.OPERATIONAL,
        }],
      }));
      initController.call(this);
      expect(this.controller.overallSparkStatus).toEqual(HealthStatusType.OPERATIONAL);
    });

    it('should be UNKNOWN', function () {
      spyOn(this.HealthService, 'getHealthCheck').and.returnValue(this.$q.resolve({
        components: [],
      }));
      initController.call(this);
      expect(this.controller.overallSparkStatus).toEqual(HealthStatusType.UNKNOWN);
    });

    it('should be undefined if HealthService call returns in error', function () {
      spyOn(this.HealthService, 'getHealthCheck').and.returnValue(this.$q.reject({
        status: 500,
      }));
      initController.call(this);
      expect(this.controller.overallSparkStatus).toBe(undefined);
    });
  });
});
