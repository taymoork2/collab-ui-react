(function () {
  'use strict';

  angular.module('Mediafusion').service('InsightGraphService', InsightGraphService);
  /* @ngInject */
  function InsightGraphService($translate) {
    var vm = this;
    vm.insightTranMap = {
      'Redirected by Cluster': $translate.instant('mediaFusion.metrics.callsRedirectedCluster'),
      'Overflowed to Cloud': $translate.instant('mediaFusion.metrics.callOverflow'),
      'Nodes Added': $translate.instant('mediaFusion.metrics.nodesAdded'),
      'Nodes Unavailable': $translate.instant('mediaFusion.metrics.nodesUnavailable'),
      'Redirected by this Cluster': $translate.instant('mediaFusion.metrics.redirectedcalls'),
      '1001': $translate.instant('mediaFusion.metrics.cloudConnectivityIssues'),
      '1002': $translate.instant('mediaFusion.metrics.clusterInServiceBelow75'),
      '1003': $translate.instant('mediaFusion.metrics.clusterUtilizationAbove75'),
      '1004': $translate.instant('mediaFusion.metrics.allCallsRedirected'),
    };
    vm.insightImage = 'images/mf_insight_16.png';
    vm.bulletField = 'bulletField';

    function getAdjustedInsightData(response) {
      _.each(response.graphData, function (value) {
        _.map(value, function (res, key) {
          if (_.includes(key, 'bullet')) {
            res = vm.insightImage;
            value[key] = res;
          }
          if (_.includes(key, 'insight')) {
            var finalinsight = '';
            if (_.includes(res, ',')) {
              res = res.split(',');
              _.each(res, function (insight1) {
                insight1 = insight1.split(/(\d+)/);
                insight1 = insight1.filter(Boolean);
                insight1[0] = insight1[0].replace(/\s+$/, '');
                insight1[0] = translateInsightType(insight1[0]);
                if (insight1[1]) {
                  insight1 = insight1[0] + ' ' + insight1[1] + '<br>';
                } else {
                  insight1 = insight1 + '<br>';
                }
                finalinsight += insight1;
                value[key] = finalinsight;
              });
            } else {
              res = res.split(/(\d+)/);
              res = res.filter(Boolean);
              res[0] = res[0].replace(/\s+$/, '');
              res[0] = translateInsightType(res[0]);
              res = res[0] + ' ' + res[1];
              value[key] = res;
            }
          }
        });
      });
      _.each(response.graphs, function (value) {
        _.map(value, function (res, key) {
          if (_.includes(key, vm.bulletField)) {
            value.customBulletField = res;
          }
        });
      });
      return response;
    }

    function translateInsightType(key) {
      var value = vm.insightTranMap[key];
      if (!_.isUndefined(value)) {
        return value;
      } else {
        return key;
      }
    }

    return {
      getAdjustedInsightData: getAdjustedInsightData,
    };
  }
})();
