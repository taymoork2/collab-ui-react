'use strict';

/* global $ */

angular.module('Core')
  .controller('TrialPreviewCtrl', ['$scope', '$rootScope', '$state', 'Log', '$window', 'Orgservice',
    function($scope, $rootScope, $state, Log, $window, Orgservice){

      $scope.curCustomer = $scope.$parent.currentCustomer;

      $scope.closePreview = function() {
        $state.go('customers.list');
      };

      Orgservice.getOrg(function(data, status) {
        if (data.success) {
          $scope.orgInfo = data;
        } else {
          Log.debug('Failed to retrieve customer org information. Status: ' + status);
        }
      }, $scope.curCustomer.customerOrgId);

      $scope.$watch($scope.$parent, function(newValue, oldValue) {
        if (newValue !== oldValue) {
          $scope.curCustomer = newValue;
        }
      });

      $scope.getProgressStatus = function(obj) {
        if(!obj){
          obj = $scope.currentTrial;
        }
        if (obj.daysLeft <= 5) {
          return 'danger';
        }
        else if (obj.daysLeft < (obj.duration/2)) {
          return 'warning';
        }
      };

    }]);
