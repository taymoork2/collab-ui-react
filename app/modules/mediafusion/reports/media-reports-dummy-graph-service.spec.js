'use strict';

describe('Service: Media Reports Dummy Graph', function () {
  var vm = this;
  vm.timeFilter = [{
    value: 0
  }, {
    value: 1
  }, {
    value: 2
  }, {
    value: 3
  }, {
    value: 4
  }];
  beforeEach(angular.mock.module('Mediafusion'));
  describe('Dummy Data Responses', function () {
    beforeEach(inject(function (_MediaReportsDummyGraphService_, _chartColors_) {
      vm.MediaReportsDummyGraphService = _MediaReportsDummyGraphService_;
      vm.chartColors = _chartColors_;
    }));

    it('MediaReportsDummyGraphService should return the expected responses for dummyAvailabilityData', function () {
      var responseFor4hrs = vm.MediaReportsDummyGraphService.dummyAvailabilityData(vm.timeFilter[0]);
      var responseFor24hrs = vm.MediaReportsDummyGraphService.dummyAvailabilityData(vm.timeFilter[1]);
      var respomseForLastWeek = vm.MediaReportsDummyGraphService.dummyAvailabilityData(vm.timeFilter[2]);
      var responseForLastMonth = vm.MediaReportsDummyGraphService.dummyAvailabilityData(vm.timeFilter[3]);
      var responseForLastThreeMonth = vm.MediaReportsDummyGraphService.dummyAvailabilityData(vm.timeFilter[4]);

      expect(responseFor4hrs).toBeDefined();
      expect(responseFor24hrs).toBeDefined();
      expect(respomseForLastWeek).toBeDefined();
      expect(responseForLastMonth).toBeDefined();
      expect(responseForLastThreeMonth).toBeDefined();

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

      expect(responseFor4hrs).toBeDefined();
      expect(responseFor24hrs).toBeDefined();
      expect(respomseForLastWeek).toBeDefined();
      expect(responseForLastMonth).toBeDefined();
      expect(responseForLastThreeMonth).toBeDefined();

      expect(responseFor4hrs[0].colorTwo).toBe(vm.chartColors.grayLightTwo);
      expect(responseFor24hrs[0].colorTwo).toBe(vm.chartColors.grayLightTwo);
      expect(respomseForLastWeek[0].colorTwo).toBe(vm.chartColors.grayLightTwo);
      expect(responseForLastMonth[0].colorTwo).toBe(vm.chartColors.grayLightTwo);
      expect(responseForLastThreeMonth[0].colorTwo).toBe(vm.chartColors.grayLightTwo);

    });

    it('MediaReportsDummyGraphService should return the expected responses for dummyLineChartData', function () {
      var responseFor4hrs = vm.MediaReportsDummyGraphService.dummyLineChartData(vm.timeFilter[0]);
      var responseFor24hrs = vm.MediaReportsDummyGraphService.dummyLineChartData(vm.timeFilter[1]);
      var respomseForLastWeek = vm.MediaReportsDummyGraphService.dummyLineChartData(vm.timeFilter[2]);
      var responseForLastMonth = vm.MediaReportsDummyGraphService.dummyLineChartData(vm.timeFilter[3]);
      var responseForLastThreeMonth = vm.MediaReportsDummyGraphService.dummyLineChartData(vm.timeFilter[4]);

      expect(responseFor4hrs).toBeDefined();
      expect(responseFor24hrs).toBeDefined();
      expect(respomseForLastWeek).toBeDefined();
      expect(responseForLastMonth).toBeDefined();
      expect(responseForLastThreeMonth).toBeDefined();

      expect(responseFor4hrs[0].balloon).toBeFalsy();
      expect(responseFor24hrs[0].balloon).toBeFalsy();
      expect(respomseForLastWeek[0].balloon).toBeFalsy();
      expect(responseForLastMonth[0].balloon).toBeFalsy();
      expect(responseForLastThreeMonth[0].balloon).toBeFalsy();

    });
  });
});
