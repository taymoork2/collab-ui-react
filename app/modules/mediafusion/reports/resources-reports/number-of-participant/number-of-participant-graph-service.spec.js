'use strict';

describe('Service: Number of Participants Graph Service', function () {
  var NumberOfParticipantGraphService;

  var validateService = {
    validate: function () {}
  };

  var numberOfParticipantChart = {
    dataProvider: [],
    startDuration: "",
    balloon: {
      enabled: false
    },
    chartCursor: {
      valueLineBalloonEnabled: false,
      valueLineEnabled: false,
      categoryBalloonEnabled: false
    },
    validateData: function () {
      return true;
    }
  };

  var daterange = {
    label: "Last 24 Hours",
    value: "0"
  };
  var numberOfParticipantGraphData = getJSONFixture('mediafusion/json/metrics-graph-report/ParticipantDistributionGraphData.json');

  beforeEach(angular.mock.module('Mediafusion'));

  beforeEach(inject(function (_NumberOfParticipantGraphService_) {
    NumberOfParticipantGraphService = _NumberOfParticipantGraphService_;
    spyOn(validateService, 'validate');
  }));

  it('should exist', function () {
    expect(NumberOfParticipantGraphService).toBeDefined();
  });

  it('setParticipantDistributionGraph should return an amchart object successfully', function () {
    var setNumberOfParticipantGraphResponse = NumberOfParticipantGraphService.setNumberOfParticipantGraph(numberOfParticipantGraphData, numberOfParticipantChart, daterange);
    expect(setNumberOfParticipantGraphResponse.graphs.length).toBe(10);
    expect(setNumberOfParticipantGraphResponse.dataProvider).toEqual(numberOfParticipantGraphData.numberOfParticipantResponse);
  });

});
