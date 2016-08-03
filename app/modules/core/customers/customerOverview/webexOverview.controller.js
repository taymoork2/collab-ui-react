(function () {
    'use strict';

    angular
      .module('Core')
      .controller('CustomerWebexOverviewCtrl', CustomerWebexOverviewCtrl);

    /* @ngInject */
    function CustomerWebexOverviewCtrl($stateParams, PartnerService, TrialWebexService, TrialTimeZoneService) {
      var vm = this;
      vm.trialId = _.get($stateParams, 'currentCustomer.trialId');
      vm.custOrgId = _.get($stateParams, 'currentCustomer.customerOrgId');
      vm.domains = [];

      init();

      vm.domains.push(buildDomain('ww.test.com', 2, false));
 vm.domains.push(buildDomain('ww.test2.com', 3, true));
      ////////////////

      function init() {
        if (vm.trialId) {
          TrialWebexService.getTrialStatus(vm.trialId).then(function (result) {
            vm.domains.push(buildDomain(result.siteUrl, result.timeZoneId, result.pending));
          });
        }

        PartnerService.getSiteUrls(vm.custOrgId).then(function (result) {
          _.each(_.get(result, 'data', []), function (site) {
            vm.domains.push(buildDomain(site, 1, false));
          });
        });
      }

      function buildDomain(siteUrl, timeZoneId, pending) {
        return {
          siteUrl: siteUrl,
          timeZone: (timeZoneId) ? _.get(TrialTimeZoneService.getTimeZone(timeZoneId), 'label', '') : null,
          pending: true /* (pending === false) ? pending : true*/
        };

      }
}
    })();
