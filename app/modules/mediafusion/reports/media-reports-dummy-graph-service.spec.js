'use strict';

var ChartColors = require('modules/core/config/chartColors').ChartColors;

describe('Service: Media Reports Dummy Graph', function () {
  var vm = this;
  vm.timeFilter = [{
    value: 0,
  }, {
    value: 1,
  }, {
    value: 2,
  }, {
    value: 3,
  }, {
    value: 4,
  }];
  vm.checkForDefined = function (for4hrs, for24hrs, forLastWeek, forLastMonth, forLastThreeMonth) {
    expect(for4hrs).toBeDefined();
    expect(for24hrs).toBeDefined();
    expect(forLastWeek).toBeDefined();
    expect(forLastMonth).toBeDefined();
    expect(forLastThreeMonth).toBeDefined();
  };
  beforeEach(angular.mock.module('Mediafusion'));
  describe('Dummy Data Responses', function () {
    beforeEach(inject(function (_MediaReportsDummyGraphService_) {
      vm.MediaReportsDummyGraphService = _MediaReportsDummyGraphService_;
    }));

    it('MediaReportsDummyGraphService should return the expected responses for dummyAvailabilityData', function () {
      var responseFor4hrs = vm.MediaReportsDummyGraphService.dummyAvailabilityData(vm.timeFilter[0]);
      var responseFor24hrs = vm.MediaReportsDummyGraphService.dummyAvailabilityData(vm.timeFilter[1]);
      var respomseForLastWeek = vm.MediaReportsDummyGraphService.dummyAvailabilityData(vm.timeFilter[2]);
      var responseForLastMonth = vm.MediaReportsDummyGraphService.dummyAvailabilityData(vm.timeFilter[3]);
      var responseForLastThreeMonth = vm.MediaReportsDummyGraphService.dummyAvailabilityData(vm.timeFilter[4]);

      vm.checkForDefined(responseFor4hrs, responseFor24hrs, respomseForLastWeek, responseForLastMonth, responseForLastThreeMonth);

      expect(responseFor4hrs.data[0].isDummy).toBe(true);
      expect(responseFor24hrs.data[0].isDummy).toBe(true);
      expect(respomseForLastWeek.data[0].isDummy).toBe(true);
      expect(responseForLastMonth.data[0].isDummy).toBe(true);
      expect(responseForLastThreeMonth.data[0].isDummy).toBe(true);
    });

    it('MediaReportsDummyGraphService should return the expected responses for dummyCallVolumeData', function () {
      var responseFor4hrs = vm.MediaReportsDummyGraphService.dummyCallVolumeData(vm.timeFilter[0]);
      var responseFor24hrs = vm.MediaReportsDummyGraphService.dummyCallVolumeData(vm.timeFilter[1]);
      var respomseForLastWeek = vm.MediaReportsDummyGraphService.dummyCallVolumeData(vm.timeFilter[2]);
      var responseForLastMonth = vm.MediaReportsDummyGraphService.dummyCallVolumeData(vm.timeFilter[3]);
      var responseForLastThreeMonth = vm.MediaReportsDummyGraphService.dummyCallVolumeData(vm.timeFilter[4]);

      vm.checkForDefined(responseFor4hrs, responseFor24hrs, respomseForLastWeek, responseForLastMonth, responseForLastThreeMonth);

      expect(responseFor4hrs[0].colorTwo).toBe(ChartColors.grayLightTwo);
      expect(responseFor24hrs[0].colorTwo).toBe(ChartColors.grayLightTwo);
      expect(respomseForLastWeek[0].colorTwo).toBe(ChartColors.grayLightTwo);
      expect(responseForLastMonth[0].colorTwo).toBe(ChartColors.grayLightTwo);
      expect(responseForLastThreeMonth[0].colorTwo).toBe(ChartColors.grayLightTwo);
    });

    it('MediaReportsDummyGraphService should return the expected responses for dummyLineChartData', function () {
      var responseFor4hrs = vm.MediaReportsDummyGraphService.dummyLineChartData(vm.timeFilter[0]);
      var responseFor24hrs = vm.MediaReportsDummyGraphService.dummyLineChartData(vm.timeFilter[1]);
      var respomseForLastWeek = vm.MediaReportsDummyGraphService.dummyLineChartData(vm.timeFilter[2]);
      var responseForLastMonth = vm.MediaReportsDummyGraphService.dummyLineChartData(vm.timeFilter[3]);
      var responseForLastThreeMonth = vm.MediaReportsDummyGraphService.dummyLineChartData(vm.timeFilter[4]);

      vm.checkForDefined(responseFor4hrs, responseFor24hrs, respomseForLastWeek, responseForLastMonth, responseForLastThreeMonth);

      expect(responseFor4hrs[0].balloon).toBeFalsy();
      expect(responseFor24hrs[0].balloon).toBeFalsy();
      expect(respomseForLastWeek[0].balloon).toBeFalsy();
      expect(responseForLastMonth[0].balloon).toBeFalsy();
      expect(responseForLastThreeMonth[0].balloon).toBeFalsy();
    });
  });
});
