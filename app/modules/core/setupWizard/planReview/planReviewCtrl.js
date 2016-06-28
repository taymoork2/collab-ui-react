(function () {
  'use strict';

  angular
    .module('Core')
    .controller('PlanReviewCtrl', PlanReviewCtrl);

  /* @ngInject */
  function PlanReviewCtrl($scope, $translate, Authinfo, FeatureToggleService, TrialService) {
    var vm = this;
    var classes = {
      userService: 'user-service-',
      hasRoomSys: 'has-room-systems'
    };

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

    vm.careServices = {
      isNewTrial: false,
      services: Authinfo.getCareServices() || []
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
    vm.getUserServiceRowClass = getUserServiceRowClass;
    vm._helpers = {
      maxServiceRows: maxServiceRows
    };
    vm.isCareEnabled = false;

    //TODO this function has to be removed when atlas-care-trials feature is removed
    vm.getGridColumnClassName = function () {
      return vm.isCareEnabled ? 'small-3' : 'small-4';
    };

    init();

    function getUserServiceRowClass(hasRoomSystem) {
      //determine how many vertical entrees there is going to be
      var returnClass = (hasRoomSystem) ? classes.hasRoomSys + ' ' + classes.userService : classes.userService;
      var serviceRows = vm._helpers.maxServiceRows();
      return returnClass + serviceRows;
    }

    function maxServiceRows() {
      var confLength = _.get(vm.confServices, 'services.length', 0) + _.get(vm.cmrServices, 'services.length', 0);
      return _.max([confLength, vm.messagingServices.services.length, vm.commServices.services.length]);
    }

    function init() {

      FeatureToggleService.atlasCareTrialsGetStatus().then(function (careStatus) {
        vm.isCareEnabled = careStatus;
      });

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

      var isNewCareTrial = _.chain(vm.careServices.services)
        .map('license')
        .filter(function (license) {
          if (license.isTrial) {
            vm.trialExists = true;
            vm.trialId = license.trialId;
            return true;
          }
          return false;
        }).filter(function (license) {
          return license.status === 'PENDING';
        })
        .value();

      if (isNewCareTrial.length) {
        vm.careServices.isNewTrial = true;
      }

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
      var now = moment().startOf('day');
      var start = moment(vm.trial.startDate).startOf('day');
      var daysUsed = moment(now).diff(start, 'days');
      vm.trialDaysRemaining = (vm.trial.trialPeriod - daysUsed);
      vm.trialUsedPercentage = Math.round((daysUsed / vm.trial.trialPeriod) * 100);
    }

  }
})();
