'use strict';

describe('Service: Cascade Bandwith Graph Service', function () {
  var CascadebandwidthGraphService;
  var allClusters = 'mediaFusion.metrics.allclusters';

  var validateService = {
    validate: function () {},
  };

  var cascadeBandwidthChart = {
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
  var cascadeBandwithGraphData = getJSONFixture('mediafusion/json/metrics-graph-report/cascade-bandwidth-graph-data.json');
  var cascadeBandwithData = getJSONFixture('mediafusion/json/metrics-graph-report/cascade-bandwidth-data.json');
  var clusterNameMap = _.cloneDeep(cascadeBandwithGraphData.clusterMap);

  beforeEach(angular.mock.module('Mediafusion'));

  beforeEach(inject(function (_CascadebandwidthGraphService_) {
    CascadebandwidthGraphService = _CascadebandwidthGraphService_;
    spyOn(validateService, 'validate');
  }));

  it('setCascadeBandwidthGraph should return an amchart object successfully', function () {
    var setCascadeBandwidthGraphResponse = CascadebandwidthGraphService.setCascadeBandwidthGraph(cascadeBandwithGraphData, cascadeBandwidthChart, allClusters, allClusters, daterange, clusterNameMap);
    expect(setCascadeBandwidthGraphResponse.graphs.length).toBe(10);
    expect(setCascadeBandwidthGraphResponse.dataProvider).toEqual(cascadeBandwithData.cascadeBandwidthResponse);
  });
});
