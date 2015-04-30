(function () {
  'use strict';
  angular
    .module('Hercules')

  .controller('ActivationStatusController',

      /* @ngInject */
      function ($interval, $scope, $stateParams, USSService, Authinfo, XhrNotificationService, ServiceDescriptor) {

        if (!Authinfo.isFusion() || !$stateParams.currentUser) {
          return;
        }

        var pollPromise,
          currentUserId = $stateParams.currentUser.id;

        var updateStatusForUser = function (id) {
          USSService.getStatusesForUser(id, function (err, data) {
            $scope.lastRequestFailed = !err ? null : XhrNotificationService.getMessages(err);
            $scope.activationStatus = data;
            $scope.inflight = false;
            poll();
          });
        };

        var poll = function () {
          $interval.cancel(pollPromise);
          pollPromise = $interval(
            _.bind(updateStatusForUser, this, currentUserId),
            2000,
            1
          );
        };

        $scope.reload = function () {
          $scope.inflight = true;
          USSService.pollCIForUser(currentUserId, function () {
            updateStatusForUser(currentUserId);
          });
        };

        $scope.getStatus = function (status) {
          return USSService.decorateWithStatus(status);
        };

        $scope.$on('$destroy', function () {
          $interval.cancel(pollPromise);
        });

        ServiceDescriptor.isFusionEnabled(function (enabled) {
          if (enabled) {
            $scope.isEnabled = true;
            updateStatusForUser(currentUserId);
          }
        });

      }
    )
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
