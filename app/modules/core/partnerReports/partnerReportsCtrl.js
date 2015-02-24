(function () {
  'use strict';

  angular
    .module('Core')
    .controller('PartnerReportCtrl', PartnerReportCtrl);

  /* @ngInject */
  function PartnerReportCtrl($scope, $translate, PartnerService, Log) {
    var vm = this;
    vm.totalOrgs = 0;
    vm.orgsData = [];

    vm.isRefresh = isRefresh;

    vm.tabs = [{
      title: 'reports.engagementTab',
      name: 'engagement',
      status: 'refresh',
    }, {
      title: 'reports.qualityTab',
      name: 'quality',
      status: 'refresh'
    }, {
      title: 'reports.opportunitiesTab',
      name: 'opportunities',
      status: 'refresh'
    }];

    vm.timeOptions = [{
      id: 0,
      label: $translate.instant('reports.time')
    }, {
      id: 1,
      label: $translate.instant('reports.week')
    }, {
      id: 2,
      label: $translate.instant('reports.month')
    }, {
      id: 3,
      label: $translate.instant('reports.threeMonths')
    }];
    vm.timeSelected = vm.timeOptions[0];

    vm.serviceOptions = [{
      id: 0,
      label: $translate.instant('reports.services')
    }];
    vm.serviceSelected = vm.serviceOptions[0];

    vm.customerOptions = [{
      id: 0,
      label: $translate.instant('reports.customers')
    }];
    vm.customerSelected = vm.customerOptions[0];

    init();

    function init() {
      PartnerService.getManagedOrgsList(function (data, status) {
        if (data.success) {
          vm.totalOrgs = data.organizations.length;
          vm.orgsData = data.organizations;
        } else {
          Log.debug('Failed to retrieve managed orgs information. Status: ' + status);
        }
        updateCustomerOptions();
        setReports();
      });
    };

    function isRefresh(tab) {
      return tab.status === 'refresh';
    };

    function updateCustomerOptions() {
      // if there are fewer than 5 orgs, then these options are unnecessary
      if (vm.totalOrgs > 5) {
        vm.customerOptions.push({
          id: 1,
          label: $translate.instant('reports.mostEngaged')
        });
        vm.customerOptions.push({
          id: 2,
          label: $translate.instant('reports.leastEngaged')
        });
        vm.customerOptions.push({
          id: 3,
          label: $translate.instant('reports.highQuality')
        });
        vm.customerOptions.push({
          id: 4,
          label: $translate.instant('reports.leastQuality')
        });
      }

      // add all customer names to the customerOptions list
      for (var orgNum in vm.orgsData) {
        vm.customerOptions.push({
          id: vm.orgsData[orgNum].customerOrgId,
          label: vm.orgsData[orgNum].customerName
        });
      }
    };

    function setReports() {
      for (var tab in vm.tabs) {
        vm.tabs[tab].status = "set";
      }
    };
  }
})();
