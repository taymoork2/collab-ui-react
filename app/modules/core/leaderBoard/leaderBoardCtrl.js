'use strict';

angular.module('Core')
  .controller('leaderBoardCtrl', ['$scope', 'Orgservice',
    function ($scope, Orgservice) {

      $scope.buckets = {
        messaging: {
          title: 'Messaging',
          subtitle: 'Standard Team Rooms',
          currentCount: 567,
          totalCount: 1000,
          description: 'Messing licenses.',
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
          unlimited: true
        },
        conferencing: {
          title: 'Conferencing',
          subtitle: 'Meeting Center',
          currentCount: 156,
          totalCount: 100,
          description: 'Cisco Meeting Center and Conferencing licenses.',
          visible: false,
          unlimited: false
        }
      };

      var getLicenses = function () {
        // get communication licenses

        // get conferencing licenses

        // get messaging licenses
        Orgservice.getAdminOrg(function (data, status) {
          if (data.success) {
            // console.log(data);
            if (data.squaredUsageCount) {
              $scope.buckets.messaging.currentCount = data.squaredUsageCount;
            }
          } else {
            // Log.debug('Get existing admin org failed. Status: ' + status);
          }
        });
      };

      var init = function () {
        //getBuckets();
        //getLicenses();
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
