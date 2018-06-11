'use strict';

describe('Service:ClusterCascadeBandwidthGraphService', function () {
  var ClusterCascadeBandwidthGraphService;
  var allClusters = 'mediaFusion.metrics.allclusters';
  var clusterId = '615209ed-98a3-4ab3-a1aa-033e5a0c1dc3';

  var validateService = {
    validate: function () {},
  };

  var clusterCascadeBandwidthChart = {
    dataProvider: [],
    startDuration: '',
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
    label: 'Last 24 Hours',
    value: '0',
  };
  var clusterCascadeBandwithGraphData = getJSONFixture('mediafusion/json/metrics-graph-report/cluster-cascade-bandwidth-graph-data.json');
  var clusterCascadeBandwithData = getJSONFixture('mediafusion/json/metrics-graph-report/cluster-cascade-bandwidth-data.json');

  beforeEach(angular.mock.module('Mediafusion'));

  beforeEach(inject(function (_ClusterCascadeBandwidthGraphService_) {
    ClusterCascadeBandwidthGraphService = _ClusterCascadeBandwidthGraphService_;
    spyOn(validateService, 'validate');
  }));

  it('setClusterCascadeBandwidthGraph should return an amchart object successfully when particular cluster is selected', function () {
    var setClusterCascadeBandwidthGraphResponse = ClusterCascadeBandwidthGraphService.setClusterCascadeBandwidthGraph(clusterCascadeBandwithGraphData, clusterCascadeBandwidthChart, allClusters, clusterId, daterange);
    expect(setClusterCascadeBandwidthGraphResponse.graphs.length).toBe(3);
    expect(setClusterCascadeBandwidthGraphResponse.dataProvider).toEqual(clusterCascadeBandwithData.clusterCascadeBandwidthResponse);
  });
});
