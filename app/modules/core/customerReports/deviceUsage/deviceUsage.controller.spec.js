'use strict';

describe('Controller: DeviceUsageCtrl', function () {

  beforeEach(angular.mock.module('Core'));
  var DeviceUsageTotalService, DeviceUsageGraphService, DeviceUsageSplunkMetricsService, DeviceUsageExportService;
  var $controller;
  var controller;
  var splunkService;
  var $scope;
  var $q;
  var $state;
  var Notification;
  var $modal;

  afterEach(function () {
    DeviceUsageTotalService = DeviceUsageGraphService = DeviceUsageSplunkMetricsService = $controller = controller = splunkService = $scope = $q = $state = undefined;
  });

  beforeEach(inject(function (_$q_, _$rootScope_, _DeviceUsageTotalService_, _DeviceUsageGraphService_, _DeviceUsageExportService_, _DeviceUsageSplunkMetricsService_, _$controller_, _$state_, _Notification_, _$modal_) {
    DeviceUsageTotalService = _DeviceUsageTotalService_;
    DeviceUsageExportService = _DeviceUsageExportService_;
    DeviceUsageGraphService = _DeviceUsageGraphService_;
    DeviceUsageSplunkMetricsService = _DeviceUsageSplunkMetricsService_;
    $controller = _$controller_;
    $scope = _$rootScope_.$new();
    $q = _$q_;
    $state = _$state_;
    Notification = _Notification_;
    $modal = _$modal_;

    sinon.stub(DeviceUsageGraphService, 'makeChart');
    DeviceUsageGraphService.makeChart.returns(amchartMock());


  }));

  describe('Missing feature toggle', function () {

    it('goes to login state if feature toggle key is missing', function (done) {
      sinon.stub($state, 'go');
      controller = $controller('DeviceUsageCtrl', {
        DeviceUsageTotalService: DeviceUsageTotalService,
        DeviceUsageGraphService: DeviceUsageGraphService,
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
        DeviceUsageGraphService: DeviceUsageGraphService,
        DeviceUsageSplunkMetricsService: DeviceUsageSplunkMetricsService,
        $scope: $scope,
        deviceUsageFeatureToggle: true,
        $state: $state
      });

      splunkService = sinon.stub(DeviceUsageSplunkMetricsService, 'reportOperation');
    });


    it('starts with fetching initial data based on default last 7 days range', function (done) {
      sinon.stub(DeviceUsageTotalService, 'getDataForRange');
      var deviceData = [
        { whatever: 42 }
      ];
      DeviceUsageTotalService.getDataForRange.returns($q.when(deviceData));
      expect(controller.loading).toBe(true);
      controller.init();
      expect(controller.timeSelected.value).toBe(0);
      $scope.$apply();
      expect(controller.noDataForRange).toBeFalsy();
      expect(controller.reportData).toEqual(deviceData);
      done();
    });

    it('splunk is reported when date range is selected', function () {
      controller.timeUpdate();
      expect(splunkService.callCount).toBe(1);
    });

    describe('export device usage data', function () {
      var fakeModal;

      beforeEach(function () {

        fakeModal = {
          result: {
            then: function (okCallback, cancelCallback) {
              this.okCallback = okCallback;
              this.cancelCallback = cancelCallback;
            }
          },
          opened: {
            then: function (okCallback) {
              okCallback();
            }
          },
          close: function (item) {
            this.result.okCallback(item);
          },
          dismiss: function (type) {
            this.result.cancelCallback(type);
          }
        };
        spyOn($modal, 'open').and.returnValue(fakeModal);
        spyOn(Notification, 'success');
        spyOn(Notification, 'warning');
        spyOn(DeviceUsageExportService, 'exportData');

        controller.init();
        expect(controller.timeSelected.value).toBe(0);
      });

      it('starts export and shows progress dialog after acknowledged in initial dialog', function () {
        controller.startDeviceUsageExport();
        expect($modal.open).toHaveBeenCalled();  // initial dialog
        fakeModal.close(); // user acks the export
        expect($modal.open).toHaveBeenCalled(); // progress dialog
        expect(DeviceUsageExportService.exportData).toHaveBeenCalled();
        expect(controller.exporting).toBeTruthy();
      });

      it('does not export device usage data after cancelled in initial dialog', function () {
        controller.startDeviceUsageExport();
        expect($modal.open).toHaveBeenCalled();
        fakeModal.dismiss(); // used cancels the export
        expect(DeviceUsageExportService.exportData).not.toHaveBeenCalled();
        expect(controller.exporting).toBeFalsy();
        expect(splunkService.callCount).toBe(0);
      });

      it('exports status 100 indicates export progress finished', function () {
        controller.startDeviceUsageExport();
        fakeModal.close();
        expect(controller.exporting).toBeTruthy();
        controller.exportStatus(100);
        expect(Notification.success).toHaveBeenCalledWith('reportsPage.usageReports.export.deviceUsageListReadyForDownload', 'reportsPage.usageReports.export.exportCompleted');
        expect(controller.exporting).toBeFalsy();
        expect(splunkService.callCount).toBe(1);
      });

      it('export cancelled (for some reason) mid-flight closes the dialog and shows a toaster', function () {
        controller.startDeviceUsageExport();
        fakeModal.close();
        expect(controller.exporting).toBeTruthy();

        controller.exportStatus(-1);
        expect(Notification.warning).toHaveBeenCalledWith('reportsPage.usageReports.export.deviceUsageExportFailedOrCancelled');
        expect(controller.exporting).toBeFalsy();
        expect(splunkService.callCount).toBe(0);
      });

    });

  });

  var amchartMock = function () {
    var amChart = {};
    amChart.dataProvider = null;
    amChart.categoryAxis = {};
    amChart.validateData = function () {};
    amChart.animateAgain = function () {};
    return amChart;
  };
});
