'use strict';

describe('Service: Media Reports Insight Graph Service', function () {
  var vm = this;

  vm.participantActivityData = getJSONFixture('mediafusion/json/metrics-graph-report/numberOfParticipant.json');
  vm.insightData = vm.participantActivityData;
  vm.nodesUnavailable = 'mediaFusion.metrics.nodesUnavailable';
  vm.nodesUnavailable = vm.nodesUnavailable + ' ' + 1;
  vm.redirectCluster = 'mediaFusion.metrics.redirectedCluster';
  vm.redirectCluster = vm.redirectCluster + ' ' + 5;
  vm.bullett = 'round';
  vm.insightCloud = 'insight_cloudParticipants';


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
      expect(ParticipantsData.graphData[5].insight_cloudParticipants).toEqual(vm.redirectCluster);
      expect(ParticipantsData.graphData[4].insight_cloudParticipants).toEqual(vm.redirectCluster + '<br>' + vm.nodesUnavailable + '<br>');
      expect(ParticipantsData.graphData[1].bullet_cloudParticipants).toEqual(vm.bullett);
      expect(ParticipantsData.graphs[0].descriptionField).toEqual(vm.insightCloud);
    });
  });
});
