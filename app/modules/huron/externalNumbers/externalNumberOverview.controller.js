(function () {
  'use strict';

  angular.module('Huron')
    .controller('ExternalNumberOverviewCtrl', ExternalNumberOverview);

  /* @ngInject */
  function ExternalNumberOverview($scope, $stateParams, ExternalNumberService, Notification) {
    var vm = this;
    vm.currentCustomer = $stateParams.currentCustomer;
    vm.loading = true;

    updatePhoneNumberCount();

    $scope.$watchCollection(function () {
      return ExternalNumberService.getAllNumbers();
    }, function (numbers) {
      vm.allNumbersCount = numbers.length + ExternalNumberService.getPendingOrderQuantity();
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
      vm.allNumbersCount = ExternalNumberService.getAllNumbers().length + ExternalNumberService.getPendingOrderQuantity();
      vm.loading = false;
    }
  }
})();
