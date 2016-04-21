(function () {
  'use strict';

  angular.module('Huron')
    .controller('ExternalNumberOverviewCtrl', ExternalNumberOverview);

  /* @ngInject */
  function ExternalNumberOverview($scope, $stateParams, ExternalNumberService, Notification) {
    var vm = this;
    vm.currentCustomer = $stateParams.currentCustomer;
    vm.loading = true;
    vm.allNumbersCount = 0;
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
  }
})();
