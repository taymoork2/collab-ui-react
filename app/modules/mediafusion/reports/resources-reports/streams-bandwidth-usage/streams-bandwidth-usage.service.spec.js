'use strict';

describe('Service:StreamsBandwidthUsageGraphService', function () {
  var StreamsBandwidthUsageGraphService;
  var allClusters = 'mediaFusion.metrics.allclusters';
  var clusterId = '615209ed-98a3-4ab3-a1aa-033e5a0c1dc3';

  var validateService = {
    validate: function () {},
  };

  var streamsBandwidthChart = {
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
  var streamsBandwithGraphData = getJSONFixture('mediafusion/json/metrics-graph-report/streams-bandwidth-graph-data.json');
  var streamsBandwithData = getJSONFixture('mediafusion/json/metrics-graph-report/streams-bandwidth-data.json');

  beforeEach(angular.mock.module('Mediafusion'));

  beforeEach(inject(function (_StreamsBandwidthUsageGraphService_) {
    StreamsBandwidthUsageGraphService = _StreamsBandwidthUsageGraphService_;
    spyOn(validateService, 'validate');
  }));

  it('setStreamsBandwidthGraph should return an amchart object successfully when particular cluster is selected', function () {
    var setStreamsBandwidthGraphResponse = StreamsBandwidthUsageGraphService.setStreamsBandwidthGraph(streamsBandwithGraphData, streamsBandwidthChart, allClusters, clusterId, daterange);
    expect(setStreamsBandwidthGraphResponse.graphs.length).toBe(4);
    expect(setStreamsBandwidthGraphResponse.dataProvider).toEqual(streamsBandwithData.streamsBandwidthResponse);
  });
});
