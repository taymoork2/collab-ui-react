'use strict';

angular.module('Core')
  .controller('leaderBoardCtrl', ['$scope', 'Orgservice',
    function ($scope, Orgservice) {

      $scope.buckets = {
        messaging: {
          title: 'Messaging',
          subtitle: 'Standard Team Rooms',
          currentCount: 0,
          totalCount: 0,
          description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam',
          visible: false
        },
        communication: {
          title: 'Communication',
          subtitle: 'Advanced Unified',
          currentCount: 0,
          totalCount: 0,
          description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam',
          visible: false
        },
        conferencing: {
          title: 'Conferencing',
          subtitle: 'Meeting Center',
          currentCount: 0,
          totalCount: 0,
          description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam',
          visible: false
        }
      };

      var getLicenses = function () {
        // get communication licenses

        // get conferencing licenses

        // get messaging licenses
        Orgservice.getAdminOrg(function (data, status) {
          if (data.success) {
            if (data.squaredUsageCount) {
              $scope.buckets.messaging.totalCount = data.squaredUsageCount;
            }
          } else {
            Log.debug('Get existing admin org failed. Status: ' + status);
          }
        });
      };

      var init = function () {
        console.log('here');
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
