(function () {
  'use strict';

  angular
    .module('Core')
    .controller('PlanReviewCtrl', PlanReviewCtrl);

  /* @ngInject */
  function PlanReviewCtrl(Authinfo, TrialService, Log, $translate, $scope, FeatureToggleService, Userservice) {
    var vm = this;

    vm.messagingServices = {
      isNewTrial: false,
      services: []
    };

    vm.confServices = {
      isNewTrial: false,
      services: []
    };

    vm.commServices = {
      isNewTrial: false,
      services: []
    };

    vm.cmrServices = {
      isNewTrial: false,
      services: []
    };

    vm.roomServices = {
      isNewTrial: false,
      services: []
    };

    vm.trialId = '';
    vm.trial = {};
    vm.trialExists = false;
    vm.trialDaysRemaining = 0;
    vm.trialUsedPercentage = 0;
    vm.isInitialized = false; // invert the logic and initialize to false so the template doesn't flicker before spinner

    init();

    function init() {

      vm.messagingServices.services = Authinfo.getMessageServices() || [];
      angular.forEach(vm.messagingServices.services, function (service) {
        if (service.license.isTrial) {
          vm.trialExists = true;
          vm.trialId = service.license.trialId;

          if (service.license.status === 'PENDING') {
            vm.messagingServices.isNewTrial = true;
          }
        }
      });

      vm.confServices.services = Authinfo.getConferenceServices() || [];
      angular.forEach(vm.confServices.services, function (service) {
        if (service.label.indexOf('Meeting Center') != -1) {
          service.label = $translate.instant('onboardModal.meetingCenter') + ' ' + service.license.capacity;
        }
        if (service.license.isTrial) {
          vm.trialExists = true;
          vm.trialId = service.license.trialId;
          if (service.license.status === 'PENDING') {
            vm.confServices.isNewTrial = true;
          }
        }
      });

      vm.commServices.services = Authinfo.getCommunicationServices() || [];
      angular.forEach(vm.commServices.services, function (service) {
        if (service.license.isTrial) {
          vm.trialExists = true;
          vm.trialId = service.license.trialId;

          if (service.license.status === 'PENDING') {
            vm.commServices.isNewTrial = true;
          }
        }
      });

      vm.roomServices.services = Authinfo.getLicenses() || [];
      angular.forEach(vm.roomServices.services, function (service) {
        if (service.licenseType === "SHARED_DEVICES") {
          if (service.isTrial) {
            vm.trialExists = true;
            vm.trialId = service.trialId;

            if (service.status === 'PENDING') {
              vm.roomServices.isNewTrial = true;
            }
          }
        }
      });

      //check if the trial exists
      if (vm.trialExists) {
        TrialService.getTrial(vm.trialId).then(function (trial) {
          populateTrialData(trial);
        }).finally(function () {
          vm.isInitialized = true;
        });
      } else {
        vm.isInitialized = true;
      }

      vm.cmrServices.services = Authinfo.getCmrServices();

      vm.sites = {};
      var lastservice = {};
      angular.forEach(vm.confServices.services, function (service) {
        if (service.license) {
          if (service.license.siteUrl) {
            if (!vm.sites[service.license.siteUrl]) {
              vm.sites[service.license.siteUrl] = [];
            }
            vm.sites[service.license.siteUrl].push(service);
          }
        }
      });
      if (Object.prototype.toString.call(vm.cmrServices.services) == '[object Array]') {
        angular.forEach(vm.cmrServices.services, function (service) {
          if (service.license) {
            if (service.license.siteUrl) {
              if (!vm.sites[service.license.siteUrl]) {
                vm.sites[service.license.siteUrl] = [];
              }
              service.label = $translate.instant('onboardModal.cmr') + ' ' + service.license.capacity;
              vm.sites[service.license.siteUrl].push(service);
            }
          }
        });
      } else {
        var cmrService = vm.cmrServices.services;
        if (cmrService && cmrService.license) {
          if (!vm.sites[cmrService.license.siteUrl]) {
            vm.sites[cmrService.license.siteUrl] = [];
          }
          cmrService.label = $translate.instant('onboardModal.cmr') + ' ' + cmrService.license.capacity;
          vm.sites[cmrService.license.siteUrl].push(cmrService);
        }
      }

      //set the parent property for showdoitlater button based on trial states
      if (!vm.messagingServices.isNewTrial && vm.commServices.isNewTrial && !vm.confServices.isNewTrial) {
        if (angular.isDefined($scope.wizard)) {
          $scope.wizard.showDoItLater = true;
        }
      }
    }
    /////////////////

    function populateTrialData(trial) {
      vm.trial = trial;
      var now = moment();
      var start = moment(vm.trial.startDate);
      var daysUsed = moment(now).diff(start, 'days');
      vm.trialDaysRemaining = (vm.trial.trialPeriod - daysUsed);
      vm.trialUsedPercentage = Math.round((daysUsed / vm.trial.trialPeriod) * 100);
    }

  }
})();