'use strict';

describe('Service: Participant Distribution Resource GraphService', function () {
  var ParticipantDistributionResourceGraphService;
  var allClusters = 'mediaFusion.metrics.allclusters';
  var clusterId = '615209ed-98a3-4ab3-a1aa-033e5a0c1dc3';

  var validateService = {
    validate: function () {},
  };

  var participantDistributionChart = {
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
  var participantDistributionGraphData = getJSONFixture('mediafusion/json/metrics-graph-report/ParticipantDistributionGraphData.json');
  var IdMap = _.cloneDeep(participantDistributionGraphData.clusterIdToNameMap);

  beforeEach(angular.mock.module('Mediafusion'));

  beforeEach(inject(function (_ParticipantDistributionResourceGraphService_) {
    ParticipantDistributionResourceGraphService = _ParticipantDistributionResourceGraphService_;

    spyOn(validateService, 'validate');
  }));

  it('should exist', function () {
    expect(ParticipantDistributionResourceGraphService).toBeDefined();
  });

  it('setParticipantDistributionGraph should return an amchart object successfully', function () {
    var setParticipantDistributionGraphResponse = ParticipantDistributionResourceGraphService.setParticipantDistributionGraph(participantDistributionGraphData, participantDistributionChart, allClusters, allClusters, daterange, IdMap);
    expect(setParticipantDistributionGraphResponse.graphs.length).toBe(11);
    expect(setParticipantDistributionGraphResponse.dataProvider[2]).toEqual(participantDistributionGraphData.participantdistributionresponse[2]);
  });

  it('setParticipantDistributionGraph should return an amchart object successfully when particular cluster is selected', function () {
    var setParticipantDistributionGraphResponse = ParticipantDistributionResourceGraphService.setParticipantDistributionGraph(participantDistributionGraphData, participantDistributionChart, allClusters, clusterId, daterange, IdMap);
    expect(setParticipantDistributionGraphResponse.graphs.length).toBe(11);
    expect(setParticipantDistributionGraphResponse.dataProvider[2]).toEqual(participantDistributionGraphData.participantdistributionresponse[2]);
  });
});
