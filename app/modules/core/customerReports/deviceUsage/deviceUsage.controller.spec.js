'use strict';

describe('Controller: DeviceUsageCtrl', function () {

  beforeEach(angular.mock.module('Core'));
  var DeviceUsageService, DeviceUsageGraphService, DeviceUsageSplunkMetricsService, DeviceUsageExportService, DeviceUsageModelService;
  var $controller;
  var controller;
  var splunkService;
  var $scope;
  var $q;
  var $state;
  var Notification;
  var $modal;

  afterEach(function () {
    DeviceUsageService = DeviceUsageGraphService = DeviceUsageSplunkMetricsService = $controller = controller = splunkService = $scope = $q = $state = DeviceUsageModelService = undefined;
  });

  beforeEach(inject(function (_$q_, _$rootScope_, _DeviceUsageService_, _DeviceUsageGraphService_, _DeviceUsageExportService_, _DeviceUsageSplunkMetricsService_, _$controller_, _$state_, _Notification_, _$modal_, _DeviceUsageModelService_) {
    DeviceUsageService = _DeviceUsageService_;
    DeviceUsageExportService = _DeviceUsageExportService_;
    DeviceUsageGraphService = _DeviceUsageGraphService_;
    DeviceUsageSplunkMetricsService = _DeviceUsageSplunkMetricsService_;
    DeviceUsageModelService = _DeviceUsageModelService_;
    $controller = _$controller_;
    $scope = _$rootScope_.$new();
    $q = _$q_;
    $state = _$state_;
    Notification = _Notification_;
    $modal = _$modal_;

    spyOn(DeviceUsageGraphService, 'makeChart');
    DeviceUsageGraphService.makeChart.and.returnValue(amchartMock());

    spyOn(DeviceUsageModelService, 'getModelsForRange');
    DeviceUsageModelService.getModelsForRange.and.returnValue($q.resolve([]));

  }));

  describe('Normal initialization fetching device data', function () {

    beforeEach(function () {
      controller = $controller('DeviceUsageCtrl', {
        DeviceUsageService: DeviceUsageService,
        DeviceUsageGraphService: DeviceUsageGraphService,
        DeviceUsageSplunkMetricsService: DeviceUsageSplunkMetricsService,
        DeviceUsageModelService: DeviceUsageModelService,
        $scope: $scope,
        $state: $state,
      });

      splunkService = spyOn(DeviceUsageSplunkMetricsService, 'reportOperation');
    });


    it('starts with fetching initial data based on default last 7 days range', function (done) {
      spyOn(DeviceUsageService, 'getDataForRange');
      spyOn(DeviceUsageService, 'extractStats');
      spyOn(DeviceUsageService, 'resolveDeviceData');
      var deviceData = {
        reportItems: [
          { totalDuration: 42 },
        ],
        missingDays: false,
      };
      DeviceUsageService.getDataForRange.and.returnValue($q.resolve(deviceData));
      DeviceUsageService.extractStats.and.returnValue($q.resolve([]));
      DeviceUsageService.resolveDeviceData.and.returnValue($q.resolve([]));

      expect(controller.waitingForDeviceMetrics).toBe(true);
      controller.init();
      expect(controller.timeSelected.value).toBe(0);
      $scope.$apply();
      expect(controller.waitingForDeviceMetrics).toBe(false);

      expect(controller.noDataForRange).toBeFalsy();
      expect(controller.reportData).toEqual(deviceData.reportItems);

      done();
    });

    it('extractStats timeout show show notification and show blank results', function (done) {
      spyOn(DeviceUsageService, 'getDataForRange');
      spyOn(DeviceUsageService, 'extractStats');
      spyOn(DeviceUsageService, 'resolveDeviceData');

      spyOn(Notification, 'error');

      var deviceData = {
        reportItems: [
          { totalDuration: 42 },
        ],
        missingDays: false,
      };
      DeviceUsageService.getDataForRange.and.returnValue($q.resolve(deviceData));
      DeviceUsageService.extractStats.and.returnValue($q.reject({
        timedout: true,
      }));
      DeviceUsageService.resolveDeviceData.and.returnValue($q.resolve([]));

      expect(controller.waitingForDeviceMetrics).toBe(true);
      controller.init();
      expect(controller.timeSelected.value).toBe(0);
      $scope.$apply();
      expect(Notification.error).toHaveBeenCalled();
      expect(controller.waitingForDeviceMetrics).toBe(false);
      expect(controller.waitForLeast).toBe(false);
      expect(controller.waitForMost).toBe(false);
      expect(controller.totalDuration).toEqual("-");
      expect(controller.noOfDevices).toEqual("-");
      expect(controller.noOfCalls).toEqual("-");

      done();
    });

    it('adds people count to the least and most used devices', function (done) {
      var peopleCountData = {
        '3333': [
          { accountId: '3333', peopleCountAvg: 33 },
        ],
        '1111': [
          { accountId: '1111', peopleCountAvg: 11 },
        ],
        '4444': [
          { accountId: '4444', peopleCountAvg: 44 },
        ],
        '2222': [
          { accountId: '2222', peopleCountAvg: 22 },
        ],
      };

      var leastUsedDevices = [
        { accountId: '1111' },
        { accountId: '2222' },
        { accountId: '3333' },
        { accountId: '4444' },
      ];

      var result = controller.addPeopleCount(leastUsedDevices, peopleCountData);

      expect(result).toEqual([
        { accountId: '1111', peopleCount: 11 },
        { accountId: '2222', peopleCount: 22 },
        { accountId: '3333', peopleCount: 33 },
        { accountId: '4444', peopleCount: 44 },
      ]);

      done();
    });

    it('splunk is reported when date range is selected', function () {
      controller.doTimeUpdate();
      expect(splunkService.calls.count()).toBe(1);
    });

    describe('export device usage data', function () {
      var fakeModal;

      beforeEach(function () {

        fakeModal = {
          result: {
            then: function (okCallback, cancelCallback) {
              this.okCallback = okCallback;
              this.cancelCallback = cancelCallback;
            },
          },
          opened: {
            then: function (okCallback) {
              okCallback();
            },
          },
          close: function (item) {
            this.result.okCallback(item);
          },
          dismiss: function (type) {
            this.result.cancelCallback(type);
          },
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
        expect(splunkService.calls.count()).toBe(0);
      });

      it('exports status 100 indicates export progress finished', function () {
        controller.startDeviceUsageExport();
        fakeModal.close();
        expect(controller.exporting).toBeTruthy();
        controller.exportStatus(100);
        expect(Notification.success).toHaveBeenCalledWith('reportsPage.usageReports.export.deviceUsageListReadyForDownload', 'reportsPage.usageReports.export.exportCompleted');
        expect(controller.exporting).toBeFalsy();
        expect(splunkService.calls.count()).toBe(1);
      });

      it('export cancelled (for some reason) mid-flight closes the dialog and shows a toaster', function () {
        controller.startDeviceUsageExport();
        fakeModal.close();
        expect(controller.exporting).toBeTruthy();

        controller.exportStatus(-1);
        expect(Notification.warning).toHaveBeenCalledWith('reportsPage.usageReports.export.deviceUsageExportFailedOrCancelled');
        expect(controller.exporting).toBeFalsy();
        expect(splunkService.calls.count()).toBe(0);
      });

    });

  });

  var amchartMock = function () {
    var amChart = {};
    amChart.dataProvider = null;
    amChart.categoryAxis = {};
    amChart.validateData = function () {};
    amChart.animateAgain = function () {};
    amChart.valueAxes = [];
    amChart.valueAxes[0] = {};
    return amChart;
  };
});
