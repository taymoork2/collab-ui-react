'use strict';

describe('Service: Meeting Graph Service', function () {
  var MeetingsGraphService, CommonMetricsGraphService;

  beforeEach(angular.mock.module('Mediafusion'));
  beforeEach(inject(function (_MeetingsGraphService_, _CommonMetricsGraphService_) {
    MeetingsGraphService = _MeetingsGraphService_;
    CommonMetricsGraphService = _CommonMetricsGraphService_;
  }));

  it('service should exist', function () {
    expect(MeetingsGraphService).toBeDefined();
  });

  it('should getMeetingPieGraph for given data', function () {
    var data = {
      'dataProvider': [{ name: 'clster1', value: 24 }, { name: 'cluster2', value: 11 }]
    };
    var id = 'meetingID';
    var noData = false;
    var chart;
    var chartOption = {
      'balloonText': '[[title]]<br><span style="font-size:14px"><b>[[value]] meetings</b> ([[percents]]%)</span>'
    };
    spyOn(CommonMetricsGraphService, 'getBasePieChart').and.callThrough();
    MeetingsGraphService.getMeetingPieGraph(data, chart, id, noData, chartOption);
    expect(CommonMetricsGraphService.getBasePieChart).toHaveBeenCalled();
  });
});
