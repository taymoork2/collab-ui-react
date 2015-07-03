'use strict';

angular.module('Hercules')
  .controller('HostDetailsController',

    /* @ngInject */
    function ($scope, $state, $stateParams, ConnectorService, XhrNotificationService) {
      var cluster = ConnectorService.getClusters()[$stateParams.clusterId];

      $scope.$watch(
        function () {
          var h = _.find(cluster.hosts, function (h) {
            return h.serial == $stateParams.hostSerial;
          });
          return h;
        },
        function (newVal, oldVal) {
          $scope.host = newVal;
        }
      );

      $scope.deleteHost = function () {
        return ConnectorService.deleteHost(cluster.id, $scope.host.serial).then(function () {
          if (ConnectorService.getClusters()[cluster.id]) {
            $state.go('cluster-details', {
              clusterId: cluster.id
            });
          } else {
            $state.sidepanel.close();
          }
        }, XhrNotificationService.notify);
      };

    }

  );
