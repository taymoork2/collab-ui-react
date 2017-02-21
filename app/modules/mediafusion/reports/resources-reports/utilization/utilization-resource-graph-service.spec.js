'use strict';

describe('Service: Utilization Resource GraphService', function () {
  var UtilizationResourceGraphService;
  var allClusters = 'mediaFusion.metrics.allclusters';
  var clusterId = "615209ed-98a3-4ab3-a1aa-033e5a0c1dc3";

  var validateService = {
    validate: function () {},
  };

  var utilizationChart = {
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
  var clusterNameMapping = getJSONFixture('mediafusion/json/metrics-graph-report/ParticipantDistributionGraphData.json');
  var IdMap = angular.copy(clusterNameMapping.clusterIdToNameMap);
  var UtilizationGraphData = getJSONFixture('mediafusion/json/metrics-graph-report/UtilizationGraphData.json');
  var UtilizationData = getJSONFixture('mediafusion/json/metrics-graph-report/UtilizationData.json');

  beforeEach(angular.mock.module('Mediafusion'));

  beforeEach(inject(function (_UtilizationResourceGraphService_) {
    UtilizationResourceGraphService = _UtilizationResourceGraphService_;

    spyOn(validateService, 'validate');
  }));

  it('should exist', function () {
    expect(UtilizationResourceGraphService).toBeDefined();
  });

  it('setUtilizationGraph should return an amchart object successfully', function () {

    var setUtilizationGraphResponse = UtilizationResourceGraphService.setUtilizationGraph(UtilizationGraphData, utilizationChart, allClusters, allClusters, daterange, IdMap);
    expect(setUtilizationGraphResponse.graphs.length).toBe(11);
    expect(setUtilizationGraphResponse.dataProvider).toEqual(UtilizationData.utilizationresponse);
  });

  it('setUtilizationGraph should return an amchart object successfully when particular cluster is selected', function () {

    var setUtilizationGraphResponse = UtilizationResourceGraphService.setUtilizationGraph(UtilizationGraphData, utilizationChart, allClusters, clusterId, daterange, IdMap);
    expect(setUtilizationGraphResponse.graphs.length).toBe(11);
    expect(setUtilizationGraphResponse.dataProvider).toEqual(UtilizationData.utilizationresponse);
  });

});
