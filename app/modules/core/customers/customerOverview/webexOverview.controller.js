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
    vm.helpers = {
      buildDomain: _buildDomain
    };
    init();

    ////////////////

    function init() {
      var promises = {};
      if (vm.trialId) {
        promises.trialSite = TrialWebexService.getTrialStatus(vm.trialId).catch(function () {

        });
      }
      if (vm.custOrgId) {
        promises.allSites = PartnerService.getSiteUrls(vm.custOrgId).catch(function () {

        });
      }
      $q.all(promises).then(function (result) {
        vm.domains = _.map(_.get(result, 'allSites.data', []), function (site) {
          return vm.helpers.buildDomain(site, null, false);
        });
        if (result.trialSite) {
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
