'use strict';

describe('Service: Availability Resource GraphService', function () {
  var AvailabilityResourceGraphService;
  var allClusters = 'mediaFusion.metrics.allclusters';
  var clusterId = "615209ed-98a3-4ab3-a1aa-033e5a0c1dc3";

  var validateService = {
    validate: function () {},
  };

  var availabilityChart = {
    period: "",
    startDate: "",
  };

  var daterange = {
    label: "Last 24 Hours",
    value: "0",
  };
  var clusteravailabilityGraphData = getJSONFixture('mediafusion/json/metrics-graph-report/clusterAvailabilityGraphData.json');
  var clusteravailabilityData = getJSONFixture('mediafusion/json/metrics-graph-report/clusterAvailabilityData.json');
  var clusterNameMapping = getJSONFixture('mediafusion/json/metrics-graph-report/ParticipantDistributionGraphData.json');
  var IdMap = _.cloneDeep(clusterNameMapping.clusterIdToNameMap);

  beforeEach(angular.mock.module('Mediafusion'));

  beforeEach(inject(function (_AvailabilityResourceGraphService_) {
    AvailabilityResourceGraphService = _AvailabilityResourceGraphService_;

    spyOn(validateService, 'validate');
  }));

  it('should exist', function () {
    expect(AvailabilityResourceGraphService).toBeDefined();
  });

  it('setAvailabilityGraph should exist', function () {
    expect(AvailabilityResourceGraphService.setAvailabilityGraph).toBeDefined();
  });

  it('setAvailabilityGraph should return an amchart object for dummy data successfully', function () {
    var data = {
      data: [
        {
          period: "mm",
          clusterCategories: [
            {
              category: "Seong_Cluster",
              segments: [],
            },
          ],
          startTime: "2016-09-20T10:20:14Z",
          endTime: "2016-09-21T10:20:14Z",
        },
      ],
    };

    var setAvailabilityGraphResponse = AvailabilityResourceGraphService.setAvailabilityGraph(data, availabilityChart, clusterId, allClusters, daterange, IdMap);
    expect(setAvailabilityGraphResponse.dataProvider).toEqual(
      [
        {
          "category": "Seong_Cluster",
          "segments": [],
        },
      ]);
  });

  it('setAvailabilityGraph should return an amchart object for mocked data successfully', function () {

    var setAvailabilityGraphResponse = AvailabilityResourceGraphService.setAvailabilityGraph(clusteravailabilityData, availabilityChart, clusterId, allClusters, daterange, IdMap);
    expect(setAvailabilityGraphResponse.dataProvider).toEqual(clusteravailabilityGraphData.clusteravailability[0].clusterCategories);
  });
});
