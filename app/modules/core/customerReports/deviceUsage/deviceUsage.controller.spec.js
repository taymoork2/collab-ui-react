'use strict';

describe('Controller: DeviceUsageCtrl', function () {

  beforeEach(angular.mock.module('Core'));
  var DeviceUsageTotalService, DeviceUsageSplunkMetricsService;
  var $controller;
  var controller;
  var $scope;
  var $q;

  beforeEach(inject(function (_$q_, _$rootScope_, _DeviceUsageTotalService_, _DeviceUsageSplunkMetricsService_, _$controller_) {
    DeviceUsageTotalService = _DeviceUsageTotalService_;
    DeviceUsageSplunkMetricsService = _DeviceUsageSplunkMetricsService_;
    $controller = _$controller_;
    $scope = _$rootScope_.$new();
    $q = _$q_;
  }));

  describe('Basics', function () {

    beforeEach(function () {

      sinon.stub(DeviceUsageTotalService, 'makeChart');
      DeviceUsageTotalService.makeChart.returns(amchartMock());

      controller = $controller('DeviceUsageCtrl', {
        DeviceUsageTotalService: DeviceUsageTotalService,
        DeviceUsageSplunkMetricsService: DeviceUsageSplunkMetricsService,
        $scope: $scope
      });

    });

    it('starts with fetching initial data based on default date range', function (done) {
      sinon.stub(DeviceUsageTotalService, 'getDataForLastNTimeUnits');
      DeviceUsageTotalService.getDataForLastNTimeUnits.returns($q.when([
        { totalDuration: 42 }
      ]));
      expect(controller.loading).toBe(true);
      controller.init();
      expect(controller.timeSelected.value).toBe(0);
      $scope.$apply();
      expect(controller.noDataForRange).toBeFalsy();
      expect(controller.reportData).toEqual([{ totalDuration: 42 }]);
      done();
    });

    it('no data', function (done) {
      sinon.stub(DeviceUsageTotalService, 'getDataForLastNTimeUnits');
      var noData = [];
      DeviceUsageTotalService.getDataForLastNTimeUnits.returns($q.when(noData));
      controller.init();
      $scope.$apply();
      expect(controller.noDataForRange).toBeTruthy();
      done();
    });


    it('exporting raw data', function (done) {

      sinon.stub(DeviceUsageTotalService, 'exportRawData');
      DeviceUsageTotalService.exportRawData.returns($q.when());

      sinon.stub(DeviceUsageTotalService, 'getDataForLastNTimeUnits');
      DeviceUsageTotalService.getDataForLastNTimeUnits.returns($q.when([]));

      controller.init();

      expect(controller.exporting).toBeFalsy();
      expect(controller.timeSelected.value).toBe(0);
      controller.exportRawData();
      expect(controller.exporting).toBeTruthy();
      $scope.$apply();
      expect(controller.exporting).toBeFalsy();
      done();
    });


    describe('splunk reporting', function () {
      it('when date range is selected', function () {
        var splunkService = sinon.spy(DeviceUsageSplunkMetricsService, 'reportOperation');
        controller.timeUpdate();
        expect(splunkService.callCount).toBe(1);
      });

      it('when exporting raw data', function (done) {
        var splunkService = sinon.spy(DeviceUsageSplunkMetricsService, 'reportOperation');

        sinon.stub(DeviceUsageTotalService, 'exportRawData');
        DeviceUsageTotalService.exportRawData.returns($q.when());

        sinon.stub(DeviceUsageTotalService, 'getDataForLastNTimeUnits');
        DeviceUsageTotalService.getDataForLastNTimeUnits.returns($q.when([]));

        controller.init();

        expect(controller.exporting).toBeFalsy();
        expect(controller.timeSelected.value).toBe(0);
        controller.exportRawData();
        expect(controller.exporting).toBeTruthy();
        $scope.$apply();
        expect(controller.exporting).toBeFalsy();
        expect(splunkService.callCount).toBe(1);
        done();
      });
    });
  });

  var amchartMock = function () {
    var amChart = {};
    amChart.dataProvider = null;
    amChart.categoryAxis = {};
    amChart.validateData = function () {};
    return amChart;
  };
});

