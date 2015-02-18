(function () {
  'use strict';
  angular
    .module('Hercules')
    .controller('ActivationStatusController', ['$scope', 'USSService', 'Authinfo', function ($scope, ussService, Authinfo) {
      if (!Authinfo.isFusion()) {
        $scope.isEnabled = false;
        return;
      };
      $scope.isEnabled = true;
      $scope.$watch('currentUser', function (newUser, oldUser) {
        if (!newUser || !newUser.id) return $scope.activationStatus = null;
        ussService.getStatusesForUser(newUser.id, function (err, data) {
          $scope.lastRequestFailed = err;
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
