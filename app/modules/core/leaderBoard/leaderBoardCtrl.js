'use strict';

angular.module('Core')
  .controller('leaderBoardCtrl', ['$scope', 'Log', 'Orgservice', '$filter', 'Authinfo', 'TrialService', 'FeatureToggleService', '$translate',
    function ($scope, Log, Orgservice, $filter, Authinfo, TrialService, FeatureToggleService, $translate) {

      $scope.label = $filter('translate')('leaderBoard.licenseUsage');
      $scope.state = 'license'; // Possible values are license, warning or error

      $scope.buckets = [];

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
        Orgservice.getLicensesUsage().then(function (subscriptions) {
          for (var index in subscriptions) {
            var licenses = subscriptions[index]['licenses'];
            var subscription = {};
            subscription['subscriptionId'] = subscriptions[index]['subscriptionId'];
            if (licenses.length === 0) {
              $scope.bucketKeys.forEach(function (bucket) {
                subscription[bucket] = {};
                subscription[bucket].unlimited = true;
              });
            } else {
              licenses.forEach(function (license) {
                var bucket = license.licenseType.toLowerCase();
                if (!(bucket === "cmr" || bucket === "conferencing")) {
                  subscription[bucket] = {};
                  var a = subscription[bucket];
                  a["services"] = [];
                }
                if (license.offerName !== "CF") {
                  if (license.siteUrl) {
                    if (!subscription["sites"]) {
                      subscription["sites"] = {};
                    }
                    if (!subscription["sites"][license.siteUrl]) {
                      subscription["sites"][license.siteUrl] = [];
                    }
                    subscription["sites"][license.siteUrl].push(license);
                    subscription["licensesCount"] = subscription.sites[license.siteUrl].length;
                    subscription.count = Object.keys(subscription["sites"]).length;
                  } else {
                    subscription[bucket]["services"].push(license);
                  }
                } else {
                  subscription["cf"] = {
                    "services": []
                  };
                  subscription["cf"]["services"].push(license);
                }
              });
            }
            $scope.buckets.push(subscription);
          }
        });
      };

      getLicenses();

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
