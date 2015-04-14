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

    }

  );
