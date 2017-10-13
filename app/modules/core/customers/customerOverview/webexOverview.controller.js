(function () {
  'use strict';

  angular
    .module('Core')
    .controller('CustomerWebexOverviewCtrl', CustomerWebexOverviewCtrl);

  /* @ngInject */
  function CustomerWebexOverviewCtrl($stateParams, Config, Notification, PartnerService, TrialTimeZoneService) {
    var vm = this;
    vm.custOrgId = _.get($stateParams, 'currentCustomer.customerOrgId');
    vm.domains = [];
    vm.helpers = {
      buildDomain: _buildDomain,
    };
    vm.isLoading = true;
    init();


    function init() {
      PartnerService.getSiteUrls(vm.custOrgId).then(function (result) {
        vm.domains = _.map(_.get(result, 'data.provOrderStatusResponses', []), function (site) {
          return vm.helpers.buildDomain(site.siteUrl, site.timeZoneId, site.provOrderStatus);
        });
        vm.isLoading = false;
        return vm.domains;
      }).catch(function (error) {
        vm.isLoading = false;
        Notification.errorWithTrackingId(error);
        return vm.domains;
      });
    }

    function _buildDomain(siteUrl, timeZoneId, status) {
      return {
        siteUrl: siteUrl,
        timeZone: (timeZoneId) ? _.get(TrialTimeZoneService.getTimeZone(timeZoneId), 'label', '') : null,
        pending: status !== Config.webexSiteStatus.PROVISIONED,
      };
    }
  }
})();
