(function () {
  'use strict';

  angular
    .module('core.trial')
    .controller('TrialWebexOverviewCtrl', TrialWebexOverviewCtrl);

  /* @ngInject */
  function TrialWebexOverviewCtrl($stateParams, TrialWebexService, TrialTimeZoneService) {
    var vm = this;

    vm.trialId = _.get($stateParams, 'currentCustomer.trialId');
    vm.siteUrl = '';
    vm.timezone = '';
    vm.pending = true;
    vm.webexTrialExists = false;

    init();

    ////////////////

    function init() {
      if (vm.trialId) {
        TrialWebexService.getTrialStatus(vm.trialId).then(function (status) {
          var timeZone = TrialTimeZoneService.getTimeZone(status.timeZoneId);
          vm.webexTrialExists = status.trialExists;
          vm.pending = status.pending;
          vm.timezone = timeZone.label;
          vm.siteUrl = status.siteUrl;
        });
      }
    }
  }
})();
