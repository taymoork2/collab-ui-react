'use strict';
describe('Service: HelpdeskSparkStatusService', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var $httpBackend, ReportsService, Service, ServiceDescriptor, $scope, q;

  beforeEach(inject(function (_$httpBackend_, _ReportsService_, _$rootScope_, _HelpdeskSparkStatusService_) {
    Service = _HelpdeskSparkStatusService_;
    ReportsService = _ReportsService_;
    $scope = _$rootScope_.$new();
    $httpBackend = _$httpBackend_;
    $httpBackend
      .when('GET', 'l10n/en_US.json')
      .respond({});
  }));

  describe("health report returns success", function () {

    var healthReport = {
      "components": [],
      "success": true
    };

    healthReport.components = [{
      "name": "Spark Message",
      "status": "error"
    }, {
      "name": "Spark Call",
      "status": "degraded_performance"
    }, {
      "name": "SparkHybrid",
      "status": "operational"
    }];

    beforeEach(function () {
      sinon.stub(ReportsService, 'healthMonitor');
      ReportsService.healthMonitor.yields(healthReport);
    });

    it("Gives list of all health components", function () {
      var result;
      Service.getHealthStatuses().then(function (res) {
        result = res;
      });
      $scope.$apply();
      expect(result).toEqual(healthReport.components);
    });

    it("Overall spark status is based on highest severity of the components", function () {

      var healthStatuses = [{
        "name": "Spark Message",
        "status": "error"
      }, {
        "name": "Spark Call",
        "status": "degraded_performance"
      }, {
        "name": "SparkHybrid",
        "status": "operational"
      }];

      var result = Service.highestSeverity(healthStatuses);
      expect(result).toEqual("error");

      healthStatuses = [{
        "name": "Spark Call",
        "status": "operational"
      }, {
        "name": "SparkHybrid",
        "status": "degraded_performance"
      }];

      result = Service.highestSeverity(healthStatuses);
      expect(result).toEqual("degraded_performance");

      healthStatuses = [{
        "name": "Spark Call",
        "status": "operational"
      }, {
        "name": "SparkHybrid",
        "status": "operational"
      }];

      result = Service.highestSeverity(healthStatuses);
      expect(result).toEqual("operational");

    });

  });

  describe("Health report returns unsuccessful", function () {

    it("Fails getting data from reports service", function (done) {
      var healthReport = {
        "components": [],
        "success": false
      };

      sinon.stub(ReportsService, 'healthMonitor');
      ReportsService.healthMonitor.yields(healthReport);

      var result;
      Service.getHealthStatuses().then(function (res) {
        fail();
      }).finally(done);

      $scope.$apply();
    });
  });

});