(function () {
  'use strict';
  angular
    .module('Hercules')
    .controller('ActivationStatusController', ['$interval', '$scope', '$stateParams', 'USSService', 'Authinfo', 'XhrNotificationService', function ($interval, $scope, $stateParams, ussService, Authinfo, xhrNotificationService) {
      $scope.isEnabled = Authinfo.isFusion();

      if (!$scope.isEnabled || !$stateParams.currentUser) {
        return;
      }

      var pollPromise;

      var updateStatusForUser = function (id) {
        ussService.getStatusesForUser(id, function (err, data) {
          $scope.lastRequestFailed = !err ? null : xhrNotificationService.getMessages(err);
          $scope.activationStatus = data;
          $scope.inflight = false;
          poll();
        });
      };

      var poll = function() {
        $interval.cancel(pollPromise);
        pollPromise = $interval(
          _.bind(updateStatusForUser, this, $stateParams.currentUser.id),
          2000,
          1
        );
      };

      $scope.reload = function () {
        $scope.inflight = true;
        ussService.pollCIForUser($stateParams.currentUser.id, function () {
          updateStatusForUser($stateParams.currentUser.id);
        });
      };

      $scope.getStatus = function (status) {
        return ussService.decorateWithStatus(status);
      };

      $scope.$on('$destroy', function () {
        $interval.cancel(pollPromise);
      });

      updateStatusForUser($stateParams.currentUser.id);
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
