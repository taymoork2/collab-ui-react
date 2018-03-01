'use strict';

describe('Service: Media Reports Insight Graph Service', function () {
  var vm = this;

  vm.participantActivityData = getJSONFixture('mediafusion/json/metrics-graph-report/numberOfParticipant.json');
  vm.insightData = vm.participantActivityData;
  vm.participantDistributionGraphData = getJSONFixture('mediafusion/json/metrics-graph-report/ParticipantDistributionGraphData.json');
  vm.multipleInsightData = vm.participantDistributionGraphData;
  vm.nodesUnavailable = 'mediaFusion.metrics.nodesUnavailable';
  vm.redirectCluster = 'mediaFusion.metrics.callsRedirectedCluster';
  vm.cloudConnectivityIssues = 'mediaFusion.metrics.cloudConnectivityIssues';
  vm.clusterInServiceBelow75 = 'mediaFusion.metrics.clusterInServiceBelow75';
  vm.clusterUtilizationAbove75 = 'mediaFusion.metrics.clusterUtilizationAbove75';
  vm.allCallsRedirected = 'mediaFusion.metrics.allCallsRedirected';

  vm.bullett = 'images/mf_insight_16.png';
  vm.insightCloud = 'insight_cloudParticipants';
  vm.insight1 = vm.redirectCluster + ' ' + 2;
  vm.insight2 = vm.redirectCluster + ' ' + 6;
  vm.insight3 = vm.redirectCluster + ' ' + 5;
  vm.nodesUnavailable = vm.nodesUnavailable + ' ' + 1;


  vm.checkForDefined = function (ParticipantsData) {
    expect(ParticipantsData).toBeDefined();
  };

  beforeEach(angular.mock.module('Mediafusion'));
  describe('Insight Data Responses', function () {
    beforeEach(inject(function (_InsightGraphService_) {
      vm.InsightGraphService = _InsightGraphService_;
    }));

    it('MediaReports InsightGraphService should return the expected responses for ParticipantDistributiondata', function () {
      var ParticipantsData = vm.InsightGraphService.getAdjustedInsightData(vm.insightData);

      vm.checkForDefined(ParticipantsData);
      expect(ParticipantsData.graphData[1].insight_cloudParticipants).toEqual(vm.nodesUnavailable);
      expect(ParticipantsData.graphData[4].insight_cloudParticipants).toEqual(vm.insight3 + '<br>' + vm.clusterInServiceBelow75 + '<br>');
      expect(ParticipantsData.graphData[5].insight_cloudParticipants).toEqual(vm.insight3 + '<br>' + vm.clusterUtilizationAbove75 + '<br>' + vm.allCallsRedirected + '<br>');
      expect(ParticipantsData.graphData[1].bullet_cloudParticipants).toEqual(vm.bullett);
      expect(ParticipantsData.graphs[0].descriptionField).toEqual(vm.insightCloud);
    });

    it('MediaReports InsightGraphService should return the expected responses for ParticipantDistributiondata With Multiple Insights', function () {
      var MultipleInsightData = vm.InsightGraphService.getAdjustedInsightData(vm.multipleInsightData);

      vm.checkForDefined(MultipleInsightData);
      expect(MultipleInsightData.graphData[1]['insight_3968ec71-8075-4ef9-b9e9-18f2eb8c1fef']).toEqual(vm.insight3 + '<br>' + vm.cloudConnectivityIssues + '<br>');
      expect(MultipleInsightData.graphData[1]['insight_fc0a6cc1-98e6-42d8-b366-d6e82e426c17']).toEqual(vm.insight1 + '<br>' + vm.cloudConnectivityIssues + '<br>');
      expect(MultipleInsightData.graphData[1]['insight_548d05ce-99ac-4d78-a926-3f18afd88064']).toEqual(vm.insight2 + '<br>' + vm.cloudConnectivityIssues + '<br>');
    });
  });
});
