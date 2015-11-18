'use strict';

angular.module('Core')
  .controller('leaderBoardCtrl', ['$scope', 'Log', 'Orgservice', '$filter','Authinfo', 'TrialService', '$translate',
    function ($scope, Log, Orgservice, $filter, Authinfo, TrialService, $translate) {

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

    $scope.vm = {
      trialId : '',
      trial : {},
      trialExists : false,
      trialDaysRemaining : 0,
      trialUsedPercentage : 0,
      isInitialized : false,
    };
    $scope.vm.messagingServices = {
      isNewTrial: false,
      services: []
    };

    $scope.vm.commServices = {
      isNewTrial: false,
      services: []
    };

    // AFAIK webex conferencing will never have trials
    // so no need to check if it's a new trial.
    $scope.vm.confServices = {
      isNewTrial: false,
      services: []
    };

    $scope.vm.cmrServices = {
      isNewTrial: false,
      services: []
    };

     


    function init2() {
      $scope.vm.messagingServices.services = Authinfo.getMessageServices();
      if ($scope.vm.messagingServices.services) {
        angular.forEach($scope.vm.messagingServices.services, function (service) {
          if (service.license.isTrial) {
            $scope.vm.trialExists = true;
            $scope.vm.trialId = service.license.trialId;

            if (service.license.status === 'PENDING') {
              $scope.vm.messagingServices.isNewTrial = true;
            }
          }
        });
      }

      $scope.vm.commServices.services = Authinfo.getCommunicationServices();
      if ($scope.vm.commServices.services) {
        angular.forEach($scope.vm.commServices.services, function (service) {
          if (service.license.isTrial) {
            $scope.vm.trialExists = true;
            $scope.vm.trialId = service.license.trialId;

            if (service.license.status === 'PENDING') {
              $scope.vm.commServices.isNewTrial = true;
            }
          }
        });
      }

      // AFAIK webex conferencing will never have trials
      // so no need to check if it's a new trial.
      $scope.vm.confServices.services = Authinfo.getConferenceServices();
      if ($scope.vm.confServices.services) {
        angular.forEach($scope.vm.confServices.services, function (service) {
          if (service.license.isTrial) {
            $scope.vm.trialExists = true;
            $scope.vm.trialId = service.license.trialId;
            if (service.license.status === 'PENDING') {
              $scope.vm.confServices.isNewTrial = true;
            }
          }
        });
      }
      //check if the trial exists
      if ($scope.vm.trialExists) {
        TrialService.getTrial($scope.vm.trialId).then(function (trial) {
          populateTrialData(trial);
        }).finally(function () {
          $scope.vm.isInitialized = true;
        });
      } else {
        $scope.vm.isInitialized = true;
      }

      $scope.vm.cmrServices.services = Authinfo.getCmrServices();

      $scope.vm.sites = {};
      var lastservice = {};
      angular.forEach($scope.vm.confServices.services, function (service) {
        if (service.license) {
          if (service.license.siteUrl) {
            if (!$scope.vm.sites[service.license.siteUrl]) {
              $scope.vm.sites[service.license.siteUrl] = [];
            }
            $scope.vm.sites[service.license.siteUrl].push(service);
          }
        }
      });
      if (Object.prototype.toString.call($scope.vm.cmrServices.services) == '[object Array]') {
        angular.forEach($scope.vm.cmrServices.services, function (service) {
          if (service.license) {
            if (service.license.siteUrl) {
              if (!$scope.vm.sites[service.license.siteUrl]) {
                $scope.vm.sites[service.license.siteUrl] = [];
              }
              service.label = $translate.instant('onboardModal.cmr');
              $scope.vm.sites[service.license.siteUrl].push(service);
            }
          }
        });
      } else {
        var cmrService = $scope.vm.cmrServices.services;
        if (cmrService && cmrService.license) {
          if (!$scope.vm.sites[cmrService.license.siteUrl]) {
            $scope.vm.sites[cmrService.license.siteUrl] = [];
          }
          cmrService.label = $translate.instant('onboardModal.cmr');
          $scope.vm.sites[cmrService.license.siteUrl].push(cmrService);
        }
      }

      //set the parent property for showdoitlater button based on trial states
      if (!$scope.vm.messagingServices.isNewTrial && $scope.vm.commServices.isNewTrial && !$scope.vm.confServices.isNewTrial) {
        if (angular.isDefined($scope.wizard)) {
          $scope.wizard.showDoItLater = true;
        }
      }
    }
    /////////////////

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
        init2();
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
