(function () {
  'use strict';

  angular.module('Huron')
    .controller('ExternalNumberOverviewCtrl', ExternalNumberOverview);

  /* @ngInject */
  function ExternalNumberOverview($scope, $state, $stateParams, ExternalNumberService, Notification) {
    var vm = this;
    vm.currentCustomer = $stateParams.currentCustomer;
    vm.loading = true;
    vm.allNumbersCount = 0;
    vm.isTerminusCustomer = isTerminusCustomer;
    var ALL = 'all';

    updatePhoneNumberCount();

    $scope.$watchCollection(function () {
      return ExternalNumberService.getAllNumbers();
    }, function () {
      vm.allNumbersCount = ExternalNumberService.getQuantity(ALL);
    });

    function updatePhoneNumberCount() {
      if (vm.currentCustomer && vm.currentCustomer.customerOrgId) {
        ExternalNumberService.refreshNumbers(vm.currentCustomer.customerOrgId)
          .catch(function (response) {
            Notification.errorResponse(response, 'partnerHomePage.errGetPhoneNumberCount');
          })
          .finally(function () {
            getNumberCount();
          });
      } else {
        ExternalNumberService.clearNumbers();
        getNumberCount();
      }
    }

    function getNumberCount() {
      vm.allNumbersCount = ExternalNumberService.getQuantity(ALL);
      vm.loading = false;
    }

    function isTerminusCustomer() {
      ExternalNumberService.isTerminusCustomer(vm.currentCustomer.customerOrgId).then(function (response) {
        if (response) {
          return $state.go('pstnSetup', {
            customerId: vm.currentCustomer.customerOrgId,
            customerName: vm.currentCustomer.customerName,
            customerEmail: vm.currentCustomer.customerEmail,
            customerCommunicationLicenseIsTrial: getCommTrial(vm.currentCustomer)
          });
        } else {
          return $state.go('didadd', {
            currentOrg: vm.currentCustomer
          });
        }
      });
    }

    function getCommTrial(org) {
      if (!!org.isPartner) {
        return false;
      }
      return _.get(org, 'communications.isTrial', true);
    }
  }
})();
