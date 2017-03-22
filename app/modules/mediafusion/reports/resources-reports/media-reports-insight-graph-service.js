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

    function getAdjustedInsightData(response) {
      _.each(response.graphData, function (value) {
        var finalinsight = '';
        _.map(value, function (res, key) {
          if (_.includes(key, 'bullet')) {
            res = 'round';//vm.insightImage;
            value[key] = res;
          }
          if (_.includes(key, 'insight')) {
            if (_.includes(res, ',')) {
              res = res.split(',');
              _.each(res, function (insight1) {
                insight1 = insight1.split(/(\d+)/);
                insight1[0] = insight1[0].replace(/\s+$/, '');
                insight1[0] = translateInsightType(insight1[0]);
                insight1 = insight1[0] + ' ' + insight1[1] + '<br>';
                finalinsight += insight1;
                value[key] = finalinsight;
              });
            } else {
              res = res.split(/(\d+)/);
              res[0] = res[0].replace(/\s+$/, '');
              res[0] = translateInsightType(res[0]);
              res = res[0] + ' ' + res[1];
              value[key] = res;
            }
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
