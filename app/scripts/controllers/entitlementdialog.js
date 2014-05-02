'use strict';

angular.module('wx2AdminWebClientApp')
  .controller('entitlementDialogCtrl', ['$scope', '$modalInstance', 'data', '$rootScope', '$filter',
    function($scope, $modalInstance, data, $rootScope, $filter) {
      $scope.username = data.userName;
      $scope.entitlements = {};
      for (var i=0;i<$rootScope.services.length;i++)
      {
        var service = $rootScope.services[i];
        var ciService = $filter('translate')('entitlements.'+service);
        if (data.entitlements && data.entitlements.indexOf(ciService) > -1)
        {
          $scope.entitlements[service] = true;
        }
        else
        {
          $scope.entitlements[service] = false;
        }
      }

      $scope.cancel = function() {
        $modalInstance.dismiss('canceled');
      };

      $scope.save = function() {

        if (!$scope.entitlements.webExSquared) {
          $scope.entitlements.squaredCallInitiation = false;
        }

        if ($scope.entitlements.squaredCallInitiation) {
          $scope.entitlements.webExSquared = true;
        }

        $modalInstance.close($scope.entitlements);
      };

    }
  ]);
