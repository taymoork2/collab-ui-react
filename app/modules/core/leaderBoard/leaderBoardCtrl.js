'use strict';

angular.module('Core')
  .controller('leaderBoardCtrl', ['$scope', 'Log', 'Orgservice', '$filter',
    function ($scope, Log, Orgservice, $filter) {

      $scope.buckets = {
        messaging: {
          currentCount: 0,
          description: $filter('translate')('leaderBoard.messagingDesc'),
          subtitle: $filter('translate')('leaderBoard.messagingSubtitle'),
          title: $filter('translate')('leaderBoard.messagingTitle'),
          totalCount: 0,
          unlimited: false,
          visible: false
        },
        conferencing: {
          currentCount: 0,
          description: $filter('translate')('leaderBoard.conferencingDesc'),
          subtitle: $filter('translate')('leaderBoard.conferencingSubtitle'),
          title: $filter('translate')('leaderBoard.conferencingTitle'),
          totalCount: 0,
          unlimited: false,
          visible: false
        },
        communication: {
          currentCount: 0,
          description: $filter('translate')('leaderBoard.communicationDesc'),
          subtitle: $filter('translate')('leaderBoard.communicationSubtitle'),
          title: $filter('translate')('leaderBoard.communicationTitle'),
          totalCount: 0,
          unlimited: false,
          visible: false
        }
      };

      // for explicit ordering:
      $scope.bucketKeys = [
        'messaging',
        'conferencing',
        'communication'
      ];

      var isCounted = function (license) {
        if (license.licenseType === 'CONFERENCING') {
          if (_.startsWith(license.licenseId, 'CMR')) return false; // skip
        }
        return (license.status === 'ACTIVE' || license.status === 'PENDING');
        // any license with a status not ACTIVE or PENDING should be ignored
      };

      var getLicenses = function () {
        Orgservice.getAdminOrg(function (data, status) {
          if (!data.success) {
            Log.debug('Get existing admin org failed. Status: ' + status);
            return;
          }
          if (data.licenses.length === 0) {
            $scope.bucketKeys.forEach(function (bucket) {
              $scope.buckets[bucket].unlimited = true;
            });
          } else {
            $scope.bucketKeys.forEach(function (bucket) {
              $scope.buckets[bucket].totalCount = 0;
              $scope.buckets[bucket].currentCount = 0;
            });
            data.licenses.forEach(function (license) {
              var bucket = license.licenseType.toLowerCase(); // cleaner than:
              //var bucket = ''.toLowerCase.call(license.licenseType || '');
              if ($scope.buckets[bucket] && isCounted(license)) {
                $scope.buckets[bucket].totalCount += license.volume;
                $scope.buckets[bucket].currentCount += license.usage;
              }
            });
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
