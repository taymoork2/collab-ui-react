'use strict';

angular.module('Core')
  .controller('leaderBoardCtrl', ['$scope', 'Log', 'Orgservice', '$filter', 'Authinfo', 'TrialService', '$translate',
    function ($scope, Log, Orgservice, $filter, Authinfo, TrialService, $translate) {

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
        }

      };

      $scope.vm = {
        trialId: '',
        trial: {},
        trialExists: false,
        trialDaysRemaining: 0,
        trialUsedPercentage: 0,
        isInitialized: false,
      };
      $scope.vm.messagingServices = {
        title: $filter('translate')('leaderBoard.messagingTitle'),
        unlimited: false,
        visible: false,
        isNewTrial: false,
        services: []
      };

      $scope.vm.commServices = {
        title: $filter('translate')('leaderBoard.communicationTitle'),
        unlimited: false,
        visible: false,
        isNewTrial: false,
        services: []
      };

      // AFAIK webex conferencing will never have trials
      // so no need to check if it's a new trial.
      $scope.vm.confServices = {
        title: $filter('translate')('leaderBoard.conferencingTitle'),
        unlimited: false,
        visible: false,
        isNewTrial: false,
        services: []
      };

      $scope.vm.webexServices = {
        title: $filter('translate')('leaderBoard.conferencingTitle'),
        unlimited: false,
        visible: false,
        isNewTrial: false,
        services: []
      };

      $scope.vm.cmrServices = {
        title: $filter('translate')('leaderBoard.shared_devicesTitle'),
        unlimited: false,
        visible: false,
        isNewTrial: false,
        services: []
      };

      $scope.vm.sdServices = {
        title: $filter('translate')('leaderBoard.shared_devicesTitle'),
        unlimited: false,
        visible: false,
        isNewTrial: false,
        services: []
      };

      function populateTrialData(trial) {
        $scope.vm.trial = trial;
        var now = moment().format('MMM D, YYYY');
        var start = moment($scope.vm.trial.startDate).format('MMM D, YYYY');
        var daysUsed = moment(now).diff(start, 'days');
        $scope.vm.trialDaysRemaining = ($scope.vm.trial.trialPeriod - daysUsed);
        $scope.vm.trialUsedPercentage = Math.round((daysUsed / $scope.vm.trial.trialPeriod) * 100);
      }

      // for explicit ordering:
      $scope.bucketKeys = [
        'messaging',
        'cf',
        'conferencing',
        'communication',
        'shared_devices',
        'storage'
      ];

      var map = {
        "MS": "Message",
        "CF": "Meeting 25 Party",
        "MC": "Meeting 25 Party with WebEx Meeting Center",
        "SC": "WebEx Support Center",
        "TC": "WebEx Training Center",
        "EC": "WebEx Event Center",
        "EE": "Meeting 25 Party with Webex Enterprise Edition",
        "CMR": "WebEx Collaboration Meeting Room",
        "CO": "Call",
        "ST": "Storage",
        "SD": "Spark Room System"
      };

      var getLicenses = function () {

        Orgservice.getLicensesUsage().then(function (licenses) {
          if (licenses.length === 0) {
            $scope.bucketKeys.forEach(function (bucket) {
              $scope.buckets[bucket].unlimited = true;
            });
          } else {
            licenses.forEach(function (license) {
              if (license.licenseId.lastIndexOf('CMR', 0) === 0) return;
              var bucket = license.licenseType.toLowerCase();
              var offerName = license.offerName;
              license.label = map[offerName];
              if (license.offerName !== "CF") {
                $scope.buckets[bucket].services.push(license);
              } else {
                $scope.buckets.cf.services.push(license);
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
