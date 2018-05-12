(function () {
  'use strict';

  angular.module('Mediafusion').service('MediaSneekPeekResourceService', MediaSneekPeekResourceService);
  /* @ngInject */
  function MediaSneekPeekResourceService($translate) {
    var vm = this;
    vm.allClusters = $translate.instant('mediaFusion.metrics.allclusters');

    return {
      getClusterAvailabilitySneekPeekValues: getClusterAvailabilitySneekPeekValues,
    };

    function getClusterAvailabilitySneekPeekValues(response, clusterMap, clusterAvailability, clusterId) {
      var values = [];
      var valuesArray = [];
      var liveArray = response;
      var isShow, cluster_name;
      _.each(response.data, function (val) {
        cluster_name = _.findKey(clusterMap, function (clusterValue) {
          return clusterValue === val.cluster;
        });
        if (cluster_name !== '' && cluster_name !== null && !_.isUndefined(cluster_name)) {
          values.push({ key: cluster_name, value: val.value });
        }
      });
      liveArray = values;
      liveArray = _.sortBy(liveArray, ['key'], ['asc']);
      values = _.orderBy(values, ['value'], ['asc']);
      _.each(values, function (clusterList) {
        var c_name = clusterList.key;
        valuesArray.push(c_name + ' ' + ' ' + clusterList.value + '%');
      });

      if (clusterAvailability && clusterId === vm.allClusters && values.length > 0) {
        isShow = true;
      } else {
        isShow = false;
      }
      var availabilityTooltipOptions = {
        isShow: isShow,
        values: valuesArray,
        liveArray: liveArray,
      };
      return availabilityTooltipOptions;
    }
  }
})();
