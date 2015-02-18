(function () {
  'use strict';
  angular
    .module('Hercules')
    .controller('ActivationStatusController', ['$scope', 'USSService', function ($scope, ussService) {
      $scope.$watch('currentUser', function (newUser, oldUser) {
        if (!newUser || !newUser.id) return $scope.activationStatus = null;
        ussService.getStatusesForUser(newUser.id, function (err, data) {
          $scope.activationStatus = data;
        });
      });
    }])
    .directive('herculesActivationStatus', [
      function () {
        return {
          restrict: 'E',
          scope: false,
          controller: 'ActivationStatusController',
          templateUrl: 'modules/hercules/activation-status/activation-status.html'
        };
      }
    ]);
})();
