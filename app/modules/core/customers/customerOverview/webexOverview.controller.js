(function () {
  'use strict';

  angular
    .module('Core')
    .controller('CustomerWebexOverviewCtrl', CustomerWebexOverviewCtrl);

  /* @ngInject */
  function CustomerWebexOverviewCtrl($q, $stateParams, PartnerService, TrialWebexService, TrialTimeZoneService) {
    var vm = this;
    vm.trialId = _.get($stateParams, 'currentCustomer.trialId');
    vm.custOrgId = _.get($stateParams, 'currentCustomer.customerOrgId');
    vm.domains = [];
    vm.getDomains = getDomains;
    vm.helpers = {
      buildDomain: _buildDomain
    };
    vm.getDomains();

    ////////////////

    function getDomains() {
      var fCalls = {};
      if (vm.trialId) {
        fCalls.trialSite = TrialWebexService.getTrialStatus(vm.trialId);
      }
      if (vm.custOrgId) {
        fCalls.allSites = PartnerService.getSiteUrls(vm.custOrgId);
      }
      $q.all(fCalls).then(function (result) {
        vm.domains = _.map(_.get(result, 'allSites.data', []), function (site) {
          return vm.helpers.buildDomain(site, null, false);
        });
        if (_.get(result, 'trialSite')) {
          var trialSite = vm.helpers.buildDomain(result.trialSite.siteUrl, result.trialSite.timeZoneId, result.trialSite.pending);
          var existingSiteIndex = _.findIndex(vm.domains, {
            siteUrl: trialSite.siteUrl
          });
          if (existingSiteIndex > -1) {
            vm.domains[existingSiteIndex] = trialSite;
          } else {
            vm.domains.push(trialSite);
          }

        }
        return vm.domains;
      });
    }

    function _buildDomain(siteUrl, timeZoneId, pending) {
      return {
        siteUrl: siteUrl,
        timeZone: (timeZoneId) ? _.get(TrialTimeZoneService.getTimeZone(timeZoneId), 'label', '') : null,
        pending: (pending === false) ? pending : true
      };

    }
  }
})();
