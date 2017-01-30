(function () {
  'use strict';

  angular.module('Mediafusion').service('MediaSneekPeekResourceService', MediaSneekPeekResourceService);
  /* @ngInject */
  function MediaSneekPeekResourceService($translate) {
    var vm = this;
    vm.allClusters = $translate.instant('mediaFusion.metrics.allclusters');

    return {
      getClusterAvailabilitySneekPeekValues: getClusterAvailabilitySneekPeekValues,
      getHostedOnPremisesSneekPeekValues: getHostedOnPremisesSneekPeekValues
    };

    function getClusterAvailabilitySneekPeekValues(response, clusterMap, clusterAvailability, clusterId) {
      var values = [];
      var valuesArray = [];
      var isShow, cluster_name;
      _.forEach(response.data, function (val) {
        cluster_name = _.findKey(clusterMap, function (clusterValue) {
          return clusterValue === val.cluster;
        });
        if (cluster_name !== "" && cluster_name !== null && !_.isUndefined(cluster_name)) {
          values.push({ key: cluster_name, value: val.value });
        }
      });
      values = _.orderBy(values, ['value'], ['asc']);
      _.forEach(values, function (clusterList) {
        var c_name = clusterList.key;
        c_name = (c_name.length > 17) ? c_name.substring(0, 17) + ".." : c_name;
        valuesArray.push(c_name + " " + " " + clusterList.value + "%");
      });

      if (clusterAvailability && clusterId === vm.allClusters && values.length > 0) {
        isShow = true;
      } else {
        isShow = false;
      }
      var availabilityTooltipOptions = {
        isShow: isShow,
        values: valuesArray
      };
      return availabilityTooltipOptions;
    }

    function getHostedOnPremisesSneekPeekValues(response, onprem, clusterId, clusterOptions) {
      var values = [];
      var isShow;
      _.forEach(response.data, function (val) {
        _.forEach(clusterOptions, function (option) {
          var cName = option.replace(/\W/g, "").toLowerCase();
          if (cName === val.cluster) {
            values.push({ key: option, value: val.value });
          }
        });
      });
      values = _.orderBy(values, ['value'], ['desc']);

      if (onprem && onprem !== 0 && clusterId === vm.allClusters && values.length > 0) {
        isShow = true;
      } else {
        isShow = false;
      }
      var onPremisesTooltipOptions = {
        isShow: isShow,
        values: values
      };
      return onPremisesTooltipOptions;
    }
  }
})();
