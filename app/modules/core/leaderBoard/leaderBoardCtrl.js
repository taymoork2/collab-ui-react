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
          visible: false,
          trial: false
        },
        conferencing: {
          currentCount: 0,
          description: $filter('translate')('leaderBoard.conferencingDesc'),
          subtitle: $filter('translate')('leaderBoard.conferencingSubtitle'),
          title: $filter('translate')('leaderBoard.conferencingTitle'),
          totalCount: 0,
          unlimited: false,
          visible: false,
          trial: false
        },
        communication: {
          currentCount: 0,
          description: $filter('translate')('leaderBoard.communicationDesc'),
          subtitle: $filter('translate')('leaderBoard.communicationSubtitle'),
          title: $filter('translate')('leaderBoard.communicationTitle'),
          totalCount: 0,
          unlimited: false,
          visible: false,
          trial: false
        },

        shared_devices: {
          currentCount: 0,
          title: $filter('translate')('leaderBoard.shared_devicesTitle'),
          subtitle: $filter('translate')('leaderBoard.shared_devicesSubtitle'),
          totalCount: 0,
          unlimited: false,
          visible: false,
          trial: false
        },

      };

      // for explicit ordering:
      $scope.bucketKeys = [
        'messaging',
        'conferencing',
        'communication',
        'shared_devices'
      ];

      var getLicenses = function () {
        Orgservice.getValidLicenses().then(function (licenses) {
          if (licenses.length === 0) {
            $scope.bucketKeys.forEach(function (bucket) {
              $scope.buckets[bucket].unlimited = true;
            });
          } else {
            $scope.bucketKeys.forEach(function (bucket) {
              $scope.buckets[bucket].totalCount = 0;
              $scope.buckets[bucket].currentCount = 0;
            });
            licenses.forEach(function (license) {
              // skip CMR licenses; these should not contribute toward counts
              if (license.licenseId.lastIndexOf('CMR', 0) === 0) return;
              var bucket = license.licenseType.toLowerCase();
              if ($scope.buckets[bucket]) {
                $scope.buckets[bucket].totalCount += license.volume;
                $scope.buckets[bucket].currentCount += license.usage;
                $scope.buckets[bucket].trial = license.isTrial;
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
