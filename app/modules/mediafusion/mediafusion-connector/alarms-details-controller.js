(function () {
  'use strict';

  angular.module('Mediafusion')
    .controller('AlarmsDetailsController',

      /* @ngInject */
      function ($scope, $state, $stateParams, MediafusionProxy) {

        $scope.$watch(MediafusionProxy.getClusters, function (data) {
          if (data.error) return $state.sidepanel.close();

          var cluster = _.find(data.clusters || [], function (c) {
            return c.id == $stateParams.connectorId;
          });

          if (!cluster) return $state.sidepanel.close();

          //$scope.host = _.find(cluster.hosts, function (h) {
          //return h.serial == $stateParams.hostSerial;
          //});
          //if (!$scope.host) return $state.sidepanel.close();
        }, true);

      }

    );
})();
