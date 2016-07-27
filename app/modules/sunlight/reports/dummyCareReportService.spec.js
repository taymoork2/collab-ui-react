"use strict";

describe(' DummyCareReportService', function () {
  var dummyCareReportService;

  beforeEach(module('Sunlight'));

  beforeEach(inject(function (_DummyCareReportService_) {
    dummyCareReportService = _DummyCareReportService_;

  }));

  it('should get DummyReportingData for org for time selected last week', function () {
    var response = dummyCareReportService.dummyOrgStatsData(2);
    expect(response.length).toBe(7);
    _.each(response, function (reportData) {
      expect(moment(reportData.createdTime, 'MMM DD', true).isValid()).toBe(true);
    });
  });

  it('should get DummyReportingData for org for time selected last month', function () {
    var response = dummyCareReportService.dummyOrgStatsData(3);
    expect(response.length).toBe(4);
    _.each(response, function (reportData) {
      expect(moment(reportData.createdTime, 'MMM DD', true).isValid()).toBe(true);
    });
  });

  it('should get DummyReportingData for org for time selected yesterday', function () {
    var response = dummyCareReportService.dummyOrgStatsData(1);
    expect(response.length).toBe(24);
    _.each(response, function (reportData) {
      expect(moment(reportData.createdTime, 'HH:mm', true).isValid()).toBe(true);
    });
  });

  it('should get DummyReportingData for org for time selected last 3 months', function () {
    var response = dummyCareReportService.dummyOrgStatsData(4);
    expect(response.length).toBe(3);
    _.each(response, function (reportData) {
      expect(moment(reportData.createdTime, 'MMM', true).isValid()).toBe(true);
    });
  });

});
