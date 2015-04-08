'use strict';

angular.module('Core')
  .controller('leaderBoardCtrl', ['$scope', 'Log', 'Orgservice', '$filter',
    function ($scope, Log, Orgservice, $filter) {

      $scope.buckets = {
        messaging: {
          title: $filter('translate')('leaderBoard.messagingTitle'),
          subtitle: $filter('translate')('leaderBoard.messagingSubtitle'),
          currentCount: 0,
          totalCount: 0,
          description: $filter('translate')('leaderBoard.messagingDesc'),
          visible: false,
          unlimited: false
        },
        communication: {
          title: $filter('translate')('leaderBoard.communicationTitle'),
          subtitle: $filter('translate')('leaderBoard.communicationSubtitle'),
          currentCount: 0,
          totalCount: 0,
          description: $filter('translate')('leaderBoard.communicationDesc'),
          visible: false,
          unlimited: false
        },
        conferencing: {
          title: $filter('translate')('leaderBoard.conferencingTitle'),
          subtitle: $filter('translate')('leaderBoard.conferencingSubtitle'),
          currentCount: 0,
          totalCount: 0,
          description: $filter('translate')('leaderBoard.conferencingDesc'),
          visible: false,
          unlimited: false
        }
      };

      $scope.bucketKeys = Object.keys($scope.buckets);

      var getLicenses = function () {
        Orgservice.getAdminOrg(function (data, status) {
          if (data.success) {
            if (data.licenses.length === 0) {
              $scope.buckets.messaging.unlimited = true;
              $scope.buckets.conferencing.unlimited = true;
              $scope.buckets.communication.unlimited = true;
            } else {
              for (var i = 0; i < data.licenses.length; i++) {
                if (data.licenses[i].licenseType === 'MESSAGING') {
                  $scope.buckets.messaging.totalCount = data.licenses[i].volume;
                  $scope.buckets.messaging.currentCount = data.licenses[i].usage;
                } else if (data.licenses[i].licenseType === 'CONFERENCING') {
                  $scope.buckets.conferencing.totalCount = data.licenses[i].volume;
                  $scope.buckets.conferencing.currentCount = data.licenses[i].usage;
                } else if (data.licenses[i].licenseType === 'COMMUNICATION') {
                  $scope.buckets.communication.totalCount = data.licenses[i].volume;
                  $scope.buckets.communication.currentCount = data.licenses[i].usage;
                }
              }
            }
          } else {
            Log.debug('Get existing admin org failed. Status: ' + status);
          }
        });
      };

      $scope.init = function () {
        getLicenses();
      };

      $scope.$on('Userservice::updateUsers', function () {
        getLicenses();
      });

    }
  ])
  .directive('leaderBoardBucket', function () {
    return {
      restrict: 'EA',
      controller: 'leaderBoardCtrl',
      scope: {
        bucketName: '='
      },
      templateUrl: 'modules/core/leaderBoard/leaderBoard.tpl.html'
    };
  });
