(function () {
  'use strict';

  angular.module('Core')
    .controller('leaderBoardCtrl', leaderBoardCtrl)
    .directive('crLeaderBoardBucket', crLeaderBoardBucket);

  /* @ngInject */
  function leaderBoardCtrl($scope, $translate, Orgservice, Authinfo) {

    // TODO: revisit after graduation (2016-02-17) - see if this can be moved into the template
    $scope.label = $translate.instant('leaderBoard.licenseUsage');

    $scope.state = 'license'; // Possible values are license, warning or error
    $scope.icon = 'check-gear';

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
          // check if active trial exists
          $scope.hasActiveTrial = _.some(subscriptions, trialExistsInSubscription);

          return subscriptions;
        })
        .then(function (subscriptions) {
          $scope.buckets = [];
          for (var index in subscriptions) {
            var licenses = subscriptions[index]['licenses'];
            var subscription = {};
            subscription['subscriptionId'] = subscriptions[index]['subscriptionId'];
            subscription['hasActiveTrial'] = trialExistsInSubscription(subscriptions[index]);
            if (licenses.length === 0) {
              $scope.bucketKeys.forEach(function (bucket) {
                subscription[bucket] = {};
                subscription[bucket].unlimited = true;
              });
            } else {
              licenses.forEach(function (license) {
                var bucket = license.licenseType.toLowerCase();
                if (!(bucket === 'cmr' || bucket === 'conferencing')) {
                  subscription[bucket] = {};
                  var a = subscription[bucket];
                  a['services'] = [];
                }
                if (license.offerName !== 'CF') {
                  if (license.siteUrl) {
                    if (!subscription['sites']) {
                      subscription['sites'] = {};
                    }
                    if (!subscription['sites'][license.siteUrl]) {
                      subscription['sites'][license.siteUrl] = [];
                    }
                    subscription['sites'][license.siteUrl].push(license);
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
              });
            }
            $scope.buckets.push(subscription);
          }
        });
    };

    function init() {
      getLicenses();
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
