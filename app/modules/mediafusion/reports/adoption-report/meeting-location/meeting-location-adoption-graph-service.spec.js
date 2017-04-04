'use strict';

describe('Service: Meeting Location Adoption GraphService', function () {
  var MeetingLocationAdoptionGraphService;


  var validateService = {
    validate: function () {},
  };

  var meetingLocationChart = {
    dataProvider: [],
    startDuration: "",
    balloon: {
      enabled: false,
    },
    chartCursor: {
      valueLineBalloonEnabled: false,
      valueLineEnabled: false,
      categoryBalloonEnabled: false,
    },
    validateData: function () {
      return true;
    },
  };

  var daterange = {
    label: "Last 24 Hours",
    value: "0",
  };
  var meetingLocationGraphData = getJSONFixture('mediafusion/json/metrics-graph-report/meetingLocationGraphData.json');

  beforeEach(angular.mock.module('Mediafusion'));

  beforeEach(inject(function (_MeetingLocationAdoptionGraphService_) {
    MeetingLocationAdoptionGraphService = _MeetingLocationAdoptionGraphService_;

    spyOn(validateService, 'validate');
  }));

  it('should exist', function () {
    expect(MeetingLocationAdoptionGraphService).toBeDefined();
  });

  it('setMeetingLocationGraph should return an amchart object successfully', function () {

    var setMeetingLocationResponse = MeetingLocationAdoptionGraphService.setMeetingLocationGraph(meetingLocationGraphData, meetingLocationChart, daterange);
    expect(setMeetingLocationResponse.graphs.length).toBe(5);
    expect(setMeetingLocationResponse.dataProvider).toEqual(meetingLocationGraphData.meetinglocationresponse);
  });

});
