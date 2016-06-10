(function () {
  'use strict';

  angular.module('Core')
    .controller('CustomerAdministratorOverviewCtrl', CustomerAdministratorOverview);

  /* @ngInject */
  function CustomerAdministratorOverview($http, $q, $log, $stateParams, $translate, Authinfo, Notification, CustomerAdministratorService) {
    var vm = this;
    var currentCustomer = $stateParams.currentCustomer;
    var customerOrgId = currentCustomer.customerOrgId;

    vm.count = 0;
    vm.loading = true;

    init();

    function init() {
      getAdminCount();
    }

    function getAdminCount() {
      if (currentCustomer && customerOrgId) {
        vm.loading = true;
        CustomerAdministratorService.getAssignedSalesAdministrators(customerOrgId)
          .then(function (response) {
            vm.loading = false;
            _.set(vm, 'count', response.data.totalResults);
          })
          .catch(function (response) {
            Notification.error('customerAdminPanel.customerAdministratorServiceError');
          });
      }
    }
  }
})();
