'use strict';

describe('Controller: DeviceUsageCtrl', function () {

  beforeEach(angular.mock.module('Core'));
  var DeviceUsageTotalService, DeviceUsageSplunkMetricsService;
  var $controller;
  var controller;
  var splunkService;
  var $scope;
  var $q;
  var $state;
  var Notification;

  beforeEach(inject(function (_$q_, _$rootScope_, _DeviceUsageTotalService_, _DeviceUsageSplunkMetricsService_, _$controller_, _$state_, _Notification_) {
    DeviceUsageTotalService = _DeviceUsageTotalService_;
    DeviceUsageSplunkMetricsService = _DeviceUsageSplunkMetricsService_;
    $controller = _$controller_;
    $scope = _$rootScope_.$new();
    $q = _$q_;
    $state = _$state_;
    Notification = _Notification_;

    sinon.stub(DeviceUsageTotalService, 'makeChart');
    DeviceUsageTotalService.makeChart.returns(amchartMock());


  }));

  describe('Missing feature toggle', function () {

    it('goes to login state if feature toggle key is missing', function (done) {
      sinon.stub($state, 'go');
      controller = $controller('DeviceUsageCtrl', {
        DeviceUsageTotalService: DeviceUsageTotalService,
        DeviceUsageSplunkMetricsService: DeviceUsageSplunkMetricsService,
        $scope: $scope,
        deviceUsageFeatureToggle: false,
        $state: $state
      });
      expect($state.go).toHaveBeenCalledWith('login');
      done();

    });
  });

  describe('Normal initialization fetching device data', function () {

    beforeEach(function () {
      controller = $controller('DeviceUsageCtrl', {
        DeviceUsageTotalService: DeviceUsageTotalService,
        DeviceUsageSplunkMetricsService: DeviceUsageSplunkMetricsService,
        $scope: $scope,
        deviceUsageFeatureToggle: true,
        $state: $state
      });

      splunkService = sinon.stub(DeviceUsageSplunkMetricsService, 'reportOperation');
    });


    it('starts with fetching initial data based on default last 7 days range', function (done) {
      sinon.stub(DeviceUsageTotalService, 'getDataForLastNTimeUnits');
      var deviceData = [
        { whatever: 42 }
      ];
      DeviceUsageTotalService.getDataForLastNTimeUnits.returns($q.when(deviceData));
      expect(controller.loading).toBe(true);
      controller.init();
      expect(controller.timeSelected.value).toBe(0);
      $scope.$apply();
      expect(controller.noDataForRange).toBeFalsy();
      expect(controller.reportData).toEqual(deviceData);
      done();
    });

    describe('export', function () {

      beforeEach(function () {
        sinon.stub(DeviceUsageTotalService, 'getDataForLastNTimeUnits');
        DeviceUsageTotalService.getDataForLastNTimeUnits.returns($q.when([]));
        sinon.stub(DeviceUsageTotalService, 'exportRawData');
        sinon.stub(Notification, 'notify');
      });

      it('exporting raw data successful', function (done) {
        DeviceUsageTotalService.exportRawData.returns($q.when());
        controller.init();
        expect(controller.exporting).toBeFalsy();
        expect(controller.timeSelected.value).toBe(0);
        controller.exportRawData();
        expect(controller.exporting).toBeTruthy();
        $scope.$apply();

        // Initally, last 7 days are selected
        var expectStartDate = moment().subtract(7, 'days').format("YYYY-MM-DD");
        var expectEndDate = moment().subtract(1, 'days').format("YYYY-MM-DD");

        expect(DeviceUsageTotalService.exportRawData).toHaveBeenCalledWith(expectStartDate, expectEndDate, sinon.match.any);
        expect(controller.exporting).toBeFalsy();
        done();
      });

      it('exporting raw data fails', function (done) {
        DeviceUsageTotalService.exportRawData.returns($q.reject());
        controller.init();
        controller.exportRawData();
        expect(controller.exporting).toBeTruthy();
        $scope.$apply();
        expect(Notification.notify).toHaveBeenCalledWith(sinon.match.any, 'error');
        expect(controller.exporting).toBeFalsy();
        done();
      });

    });

    describe('splunk reporting', function () {
      it('when date range is selected', function () {
        controller.timeUpdate();
        expect(splunkService.callCount).toBe(1);
      });

      it('when exporting raw data', function (done) {

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

