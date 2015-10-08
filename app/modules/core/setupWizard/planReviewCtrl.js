(function () {
  'use strict';

  angular
    .module('Core')
    .controller('PlanReviewCtrl', PlanReviewCtrl);

  /* @ngInject */
  function PlanReviewCtrl(Authinfo, TrialService, Log, $translate, $scope, FeatureToggleService, Userservice) {
    /*jshint validthis: true */
    var vm = this;
    vm.messagingServices = {
      isNewTrial: false,
      services: []
    };

    vm.commServices = {
      isNewTrial: false,
      services: []
    };

    // AFAIK webex conferencing will never have trials
    // so no need to check if it's a new trial.
    vm.confServices = {
      isNewTrial: false,
      services: []
    };

    vm.cmrServices = {
      isNewTrial: false,
      services: []
    };

    vm.trialId = '';
    vm.trial = {};
    vm.trialExists = false;
    vm.trialDaysRemaining = 0;
    vm.trialUsedPercentage = 0;
    vm.isInitialized = false; // invert the logic and initialize to false so the template doesn't flicker before spinner
    vm.gsxFeature = false;

    Userservice.getUser('me', function (data, status) {
      FeatureToggleService.getFeatureForUser(data.id, 'gsxdemo').then(function (value) {
        vm.gsxFeature = value;
      }).finally(function () {
        activate();
      });
    });

    function activate() {
      vm.messagingServices.services = Authinfo.getMessageServices();
      if (vm.messagingServices.services) {
        angular.forEach(vm.messagingServices.services, function (service) {
          if (service.license.isTrial) {
            vm.trialExists = true;
            vm.trialId = service.license.trialId;

            if (service.license.status === 'PENDING') {
              vm.messagingServices.isNewTrial = true;
            }
          }
        });
      }

      vm.commServices.services = Authinfo.getCommunicationServices();
      if (vm.commServices.services) {
        angular.forEach(vm.commServices.services, function (service) {
          if (service.license.isTrial) {
            vm.trialExists = true;
            vm.trialId = service.license.trialId;

            if (service.license.status === 'PENDING') {
              vm.commServices.isNewTrial = true;
            }
          }
        });
      }

      // AFAIK webex conferencing will never have trials
      // so no need to check if it's a new trial.
      vm.confServices.services = Authinfo.getConferenceServices();
      if (vm.confServices.services) {
        angular.forEach(vm.confServices.services, function (service) {
          if (vm.gsxFeature && service.label.indexOf('Meeting Center') != -1) {
            service.label = 'Meeting Center';
          }
          if (service.license.isTrial) {
            vm.trialExists = true;
            vm.trialId = service.license.trialId;
            if (service.license.status === 'PENDING') {
              vm.confServices.isNewTrial = true;
            }
          }
        });
      }
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
              service.label = $translate.instant('onboardModal.cmr');
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
          cmrService.label = $translate.instant('onboardModal.cmr');
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
      var now = moment().format('MMM D, YYYY');
      var start = moment(vm.trial.startDate).format('MMM D, YYYY');
      var daysUsed = moment(now).diff(start, 'days');
      vm.trialDaysRemaining = (vm.trial.trialPeriod - daysUsed);
      vm.trialUsedPercentage = Math.round((daysUsed / vm.trial.trialPeriod) * 100);
    }

  }
})();
