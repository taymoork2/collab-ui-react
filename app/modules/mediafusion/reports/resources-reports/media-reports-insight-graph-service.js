(function () {
  'use strict';

  angular.module('Mediafusion').service('InsightGraphService', InsightGraphService);
  /* @ngInject */
  function InsightGraphService($translate) {
    var vm = this;
    vm.insightTranMap = {
      'Redirected by Cluster': $translate.instant('mediaFusion.metrics.redirectedCluster'),
      'Overflowed to Cloud': $translate.instant('mediaFusion.metrics.cloudcalls'),
      'Nodes Added': $translate.instant('mediaFusion.metrics.nodesAdded'),
      'Nodes Unavailable': $translate.instant('mediaFusion.metrics.nodesUnavailable'),
      'Redirected by this Cluster': $translate.instant('mediaFusion.metrics.redirectedcalls'),
    };
    //vm.insightImage = "images/star-2.png";

    function getParticipantDistributionInsightData(response) {
      _.forEach(response.graphData, function (value) {
        _.map(value, function (res, key) {
          if (_.includes(key, 'bullet')) {
            res = 'round';//vm.insightImage;
            value[key] = res;
          }
          if (_.includes(key, 'insight')) {
            var insightData = res.split(/(\d+)/);
            insightData[0] = insightData[0].replace(/\s+$/, '');
            insightData[0] = vm.insightTranMap[insightData[0]];
            res = insightData[0] + ' ' + insightData[1];
            value[key] = res;
          }
        });
      });
      return response;
    }

    function getParticipantActivityInsightData(response) {
      _.forEach(response.graphData, function (value) {
        var finalinsight = '';
        if (!_.isUndefined(value.insight_cloudParticipants)) {
          var intialinsight = value[response.graphs[0]['descriptionField']];
          if (_.includes(intialinsight, ',')) {
            intialinsight = intialinsight.split(',');
            _.forEach(intialinsight, function (insight1) {
              insight1 = insight1.split(/(\d+)/);
              insight1[0] = insight1[0].replace(/\s+$/, '');
              insight1[0] = vm.insightTranMap[insight1[0]];
              insight1 = insight1[0] + ' ' + insight1[1] + '<br>';
              finalinsight += insight1;
            });
          } else {
            intialinsight = intialinsight.split(/(\d+)/);
            intialinsight[0] = intialinsight[0].replace(/\s+$/, '');
            intialinsight[0] = vm.insightTranMap[intialinsight[0]];
            intialinsight = intialinsight[0] + ' ' + intialinsight[1];
            finalinsight = intialinsight;
          }
          value.insight_cloudParticipants = finalinsight;
          value.bullet_cloudParticipants = 'round';//vm.insightImage;
        }
      });

      return response;
    }

    return {
      getParticipantDistributionInsightData: getParticipantDistributionInsightData,
      getParticipantActivityInsightData: getParticipantActivityInsightData,
    };
  }
})();
