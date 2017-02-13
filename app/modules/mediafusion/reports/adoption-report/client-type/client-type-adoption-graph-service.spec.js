'use strict';

describe('Service: Client Type Adoption GraphService', function () {
  var ClientTypeAdoptionGraphService;


  var validateService = {
    validate: function () {}
  };

  var clientTypeChart = {
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
  var clientTypeGraphData = getJSONFixture('mediafusion/json/metrics-graph-report/clientTypeGraphData.json');

  beforeEach(angular.mock.module('Mediafusion'));

  beforeEach(inject(function (_ClientTypeAdoptionGraphService_) {
    ClientTypeAdoptionGraphService = _ClientTypeAdoptionGraphService_;

    spyOn(validateService, 'validate');
  }));

  it('should exist', function () {
    expect(ClientTypeAdoptionGraphService).toBeDefined();
  });

  it('setClientTypeGraph should return an amchart object successfully', function () {

    var setClientTypeResponse = ClientTypeAdoptionGraphService.setClientTypeGraph(clientTypeGraphData, clientTypeChart, daterange);
    // expect(setClientTypeResponse.graphs.length).toBe(5);
    expect(setClientTypeResponse.dataProvider).toEqual(clientTypeGraphData.clienttyperesponse);
  });

});
