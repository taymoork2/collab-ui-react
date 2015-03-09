'use strict';

angular.module('Core')
  .controller('leaderBoardCtrl', ['$scope', 'Log', 'Orgservice',
    function ($scope, Log, Orgservice) {

      $scope.buckets = {
        messaging: {
          title: 'Messaging',
          subtitle: 'Standard Team Rooms',
          currentCount: 0,
          totalCount: 0,
          description: 'Messaging licenses.',
          visible: false,
          unlimited: false
        },
        communication: {
          title: 'Communication',
          subtitle: 'Advanced Unified',
          currentCount: 0,
          totalCount: 0,
          description: 'Cisco Unified Communication licenses.',
          visible: false,
          unlimited: false
        },
        conferencing: {
          title: 'Conferencing',
          subtitle: 'Meeting Center',
          currentCount: 0,
          totalCount: 0,
          description: 'Cisco Meeting Center and Conferencing licenses.',
          visible: false,
          unlimited: false
        }
      };

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

      var init = function () {
        //getBuckets();
        getLicenses();
      };

      init();

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
