(function () {
  'use strict';
  angular
    .module('Hercules')
    .controller('ActivationStatusController', ['$scope', '$stateParams', 'USSService', 'Authinfo', 'XhrNotificationService', function ($scope, $stateParams, ussService, Authinfo, xhrNotificationService) {
      $scope.isEnabled = Authinfo.isFusion();
      if (!$scope.isEnabled || !$stateParams.currentUser) return;

      var updateStatusForUser = function (id) {
        $scope.inflight = true;
        ussService.getStatusesForUser(id, function (err, data) {
          $scope.lastRequestFailed = !err ? null : xhrNotificationService.getMessages(err);
          $scope.activationStatus = data;
          $scope.inflight = false;
        });
      };

      updateStatusForUser($stateParams.currentUser.id);

      $scope.reload = function () {
        $scope.inflight = true;
        ussService.pollCIForUser($stateParams.currentUser.id, function () {
          updateStatusForUser($stateParams.currentUser.id);
        });
      };

      $scope.getStatus = function (status) {
        return ussService.decorateWithStatus(status);
      };

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
