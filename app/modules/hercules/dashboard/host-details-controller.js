'use strict';

angular.module('Hercules')
  .controller('HostDetailsController',

    /* @ngInject */
    function ($scope, $state, $stateParams, ConnectorService) {

      $scope.deleteHost = function (clusterId, serial) {
        $scope.deleteHostInflight = true;
        ConnectorService.deleteHost(clusterId, serial, function () {
          $scope.deleteHostInflight = false;
        });
      };

      $scope.toggleEdit = function (hostName) {
        if ($scope.editingHost == hostName) {
          $scope.editingHost = null;
        } else {
          $scope.editingHost = hostName;
        }
      };

    }

  );
