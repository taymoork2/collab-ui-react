'use strict';

angular.module('Core')

.directive('crDetailsBody', [

  function () {
    return {
      restrict: 'EA',
      // replace: true,
      transclude: true,
      templateUrl: 'modules/core/users/userDetails/detailsBody.tpl.html',
      scope: {
        save: '&onSave',
        close: '&close',
        saveDisabled: '=saveDisabled'
      },
      controller: function ($scope, $rootScope, $state, $window) {
        $scope.closeDetails = function () {
          $state.go('users.list');
        };
      }
    };
  }
])

;
