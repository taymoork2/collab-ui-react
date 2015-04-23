(function () {
  'use strict';

  angular
    .module('Core')
    .controller('PlanReviewCtrl', PlanReviewCtrl);

  /* @ngInject */
  function PlanReviewCtrl(Authinfo, TrialService, Log) {
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
    vm.confServices = {};

    vm.trialId = '';
    vm.trial = {};
    vm.trialExists = false;
    vm.trialDaysRemaining = 0;
    vm.trialUsedPercentage = 0;
    vm.processing = false;

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
      vm.confServices = Authinfo.getConferenceServices();

      if (vm.trialExists) {
        vm.processing = true;
        TrialService.getTrial(vm.trialId).then(function (trial) {
          populateTrialData(trial);
        }).finally(function () {
          vm.processing = false;
        });
      }

    }

    activate();
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
