'use strict';

angular.module('Core')
  .controller('leaderBoardCtrl', ['$scope', 'Log', 'Orgservice', '$filter', 'Authinfo', 'TrialService', 'FeatureToggleService', '$translate',
    function ($scope, Log, Orgservice, $filter, Authinfo, TrialService, FeatureToggleService, $translate) {
      $scope.buckets = {
        messaging: {
          title: $filter('translate')('leaderBoard.messagingTitle'),
          subtitle: $filter('translate')('leaderBoard.messagingSubtitle'),
          unlimited: false,
          visible: false,
          isNewTrial: false,
          services: []
        },
        cf: {
          title: $filter('translate')('leaderBoard.conferencingTitle'),
          subtitle: $filter('translate')('leaderBoard.conferencingSubtitle'),
          unlimited: false,
          visible: false,
          isNewTrial: false,
          services: []
        },
        communication: {
          title: $filter('translate')('leaderBoard.communicationTitle'),
          subtitle: $filter('translate')('leaderBoard.communicationSubtitle'),
          unlimited: false,
          visible: false,
          isNewTrial: false,
          services: []
        },
        conferencing: {
          title: $filter('translate')('leaderBoard.conferencingTitle'),
          subtitle: $filter('translate')('leaderBoard.conferencingSubtitle'),
          unlimited: false,
          visible: false,
          isNewTrial: false,
          services: []
        },
        shared_devices: {
          title: $filter('translate')('leaderBoard.shared_devicesTitle'),
          subtitle: $filter('translate')('leaderBoard.shared_devicesSubtitle'),
          unlimited: false,
          visible: false,
          isNewTrial: false,
          services: []
        },
        storage: {
          services: []
        },
        sites: {}
      };

      // for explicit ordering:
      $scope.bucketKeys = [
        'messaging',
        'cf',
        'conferencing',
        'communication',
        'shared_devices',
        'storage',
        'sites'
      ];

      $scope.isStormBranding = false;
      FeatureToggleService.supports(FeatureToggleService.features.atlasStormBranding).then(function (result) {
        $scope.isStormBranding = result;
      });

      var getLicenses = function () {
        Orgservice.getLicensesUsage().then(function (licenses) {
          if (licenses.length === 0) {
            $scope.bucketKeys.forEach(function (bucket) {
              $scope.buckets[bucket].unlimited = true;
            });
          } else {
            licenses.forEach(function (license) {
              var bucket = license.licenseType.toLowerCase();
              if (license.offerName !== "CF") {
                if (license.siteUrl) {
                  if (!$scope.buckets.sites[license.siteUrl]) {
                    $scope.buckets.sites[license.siteUrl] = [];
                  }
                  $scope.buckets.sites[license.siteUrl].push(license);
                  $scope.buckets.licensesCount = $scope.buckets.sites[license.siteUrl].length;
                } else {
                  $scope.buckets[bucket].services.push(license);
                }
              } else {
                $scope.buckets.cf.services.push(license);
              }
            });
            $scope.buckets.count = Object.keys($scope.buckets.sites).length;
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
