'use strict';

/* global $ */

angular.module('Core')
  .controller('CustomerPreviewCtrl', ['$scope', '$rootScope', '$state', 'Log', '$window', 'Orgservice',
    function ($scope, $rootScope, $state, Log, $window, Orgservice) {

      $scope.curCustomer = $scope.$parent.currentCustomer;

      $scope.closePreview = function () {
        $state.go('customers.list');
      };

      Orgservice.getOrg(function (data, status) {
        if (data.success) {
          $scope.orgInfo = data;
        } else {
          Log.debug('Failed to retrieve customer org information. Status: ' + status);
        }
      }, $scope.curCustomer.customerOrgId);

      $scope.$watch($scope.$parent, function (newValue, oldValue) {
        if (newValue !== oldValue) {
          $scope.curCustomer = newValue;
        }
      });

    }
  ]);
