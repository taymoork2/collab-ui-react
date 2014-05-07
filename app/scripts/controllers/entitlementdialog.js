'use strict';

/* global $ */

angular.module('wx2AdminWebClientApp')
  .controller('entitlementDialogCtrl', ['$scope', '$modalInstance', 'data', '$rootScope', '$filter',
    function($scope, $modalInstance, data, $rootScope, $filter) {
      $scope.username = data.userName;
      $scope.entitlements = {};
      for (var i = 0; i < $rootScope.services.length; i++) {
        var service = $rootScope.services[i];
        var ciService = $filter('translate')('entitlements.' + service);
        if (data.entitlements && data.entitlements.indexOf(ciService) > -1) {
          $scope.entitlements[service] = true;
        } else {
          $scope.entitlements[service] = false;
        }
      }

      $scope.cancel = function() {
        $modalInstance.dismiss('canceled');
      };

      $scope.save = function() {
        $modalInstance.close($scope.entitlements);
      };

      $scope.validateEntitlements = function(element) {
        var elementName = $(element).attr('name');
        //Unchecks all entitlements if webexSquared is unchecked.
        if (elementName === 'webExSquared' && $scope.entitlements.webExSquared === false) {
          for (var entitlement in $scope.entitlements) {
            if (entitlement !== 'webExSquared') {
              $('input[name='+entitlement+']').iCheck('uncheck');
            }
          }
        }

        //Checks webExSquared if any other entitlement is selected.
        if (elementName !== 'webExSquared' && $scope.entitlements[elementName] === true) {
          $('input[name=webExSquared]').iCheck('check');
        }
      };

    }
  ]);
