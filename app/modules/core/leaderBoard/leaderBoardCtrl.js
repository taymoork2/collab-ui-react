(function () {
  'use strict';

  angular.module('Core')
    .controller('leaderBoardCtrl', leaderBoardCtrl)
    .directive('crLeaderBoardBucket', crLeaderBoardBucket);

  /* @ngInject */
  function leaderBoardCtrl($scope, $translate, Authinfo, Config, Orgservice, TrialService, WebExUtilsFact) {

    // TODO: revisit after graduation (2016-02-17) - see if this can be moved into the template
    $scope.label = $translate.instant('leaderBoard.licenseUsage');

    $scope.state = 'license'; // Possible values are license, warning or error
    $scope.icon = 'check-gear';
    $scope.trialDaysLeft = undefined;
    $scope.roomSystemsCount = 0;

    $scope.bucketKeys = [
      'messaging',
      'cf',
      'conferencing',
      'communication',
      'shared_devices',
      'storage',
      'sites'
    ];

    $scope.isCustomer = !Authinfo.isPartner();
    $scope.isAtlasTrialConversion = false;
    $scope.hasActiveTrial = false;
    $scope.trialExistsInSubscription = trialExistsInSubscription;

    var getLicenses = function () {
      Orgservice.getLicensesUsage()
        .then(function (subscriptions) {
          $scope.roomSystemsCount = 0;
          // check if active trial exists
          $scope.hasActiveTrial = _.some(subscriptions, trialExistsInSubscription);
          return subscriptions;
        })
        .then(function (subscriptions) {
          $scope.buckets = [];
          var updateSubscriptionBucket = function (bucket) {
            subscription[bucket] = {};
            subscription[bucket].unlimited = true;
          };
          var updateSubscriptionAndLicenses = function (license, licenseIndex) {
            var bucket = license.licenseType.toLowerCase();

            if (!(bucket === 'cmr' || bucket === 'conferencing')) {
              subscription[bucket] = {};
              var a = subscription[bucket];
              a['services'] = [];
              if (license.licenseType === Config.licenseTypes.SHARED_DEVICES) {
                $scope.roomSystemsCount = $scope.roomSystemsCount + license.volume;
              }
            }

            license.id = bucket + index + licenseIndex;
            license.siteAdminUrl = null;
            license.hideUsage = false;

            if (license.offerName !== 'CF') {
              var licSiteUrl = license.siteUrl;

              if (licSiteUrl) {
                if (!WebExUtilsFact.isCIEnabledSite(licSiteUrl)) {
                  license.siteAdminUrl = WebExUtilsFact.getSiteAdminUrl(licSiteUrl);
                  license.hideUsage = true;
                }

                if (!subscription['sites']) {
                  subscription['sites'] = {};
                }

                if (!subscription['sites'][licSiteUrl]) {
                  subscription['sites'][licSiteUrl] = [];
                }

                subscription['sites'][licSiteUrl].push(license);
                subscription['licensesCount'] = subscription.sites[license.siteUrl].length;
                subscription.count = Object.keys(subscription['sites']).length;
              } else {
                subscription[bucket]['services'].push(license);
              }
            } else {
              subscription['cf'] = {
                'services': []
              };
              subscription['cf']['services'].push(license);
            }
          };
          for (var index in subscriptions) {
            var licenses = subscriptions[index]['licenses'];
            var subscription = {};
            subscription['subscriptionId'] = subscriptions[index]['subscriptionId'];
            subscription['hasActiveTrial'] = trialExistsInSubscription(subscriptions[index]);
            if (licenses.length === 0) {
              $scope.bucketKeys.forEach(updateSubscriptionBucket);
            } else {
              licenses.forEach(updateSubscriptionAndLicenses);
            }
            $scope.buckets.push(subscription);
          }
        });
    };

    function init() {
      getLicenses();
      TrialService.getDaysLeftForCurrentUser().then(function (daysLeft) {
        $scope.trialDaysLeft = daysLeft;
      });
    }

    init();

    $scope.$on('Userservice::updateUsers', function () {
      getLicenses();
    });

    $scope.$on('USER_LIST_UPDATED', function () {
      getLicenses();
    });

    function trialExistsInSubscription(subscription) {
      var licenses = _.get(subscription, 'licenses', []);
      return _.some(licenses, function (license) {
        return license.isTrial;
      });
    }
  }

  function crLeaderBoardBucket() {
    return {
      restrict: 'EA',
      controller: 'leaderBoardCtrl',
      scope: {
        bucketName: '='
      },
      templateUrl: 'modules/core/leaderBoard/leaderBoard.tpl.html'
    };
  }
})();
