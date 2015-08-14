(function () {
  'use strict';

  angular.module('Huron')
    .controller('ExternalNumberOverviewCtrl', ExternalNumberOverview);

  /* @ngInject */
  function ExternalNumberOverview($scope, $stateParams, ExternalNumberService, ExternalNumberPool, Notification) {
    var vm = this;
    vm.currentCustomer = $stateParams.currentCustomer;
    vm.loading = true;

    updatePhoneNumberCount();

    $scope.$watchCollection(function () {
      return ExternalNumberService.getAllNumbers();
    }, function (numbers) {
      vm.allNumbersCount = numbers.length;
    });

    function updatePhoneNumberCount() {
      if (vm.currentCustomer && vm.currentCustomer.customerOrgId) {
        ExternalNumberPool.getAll(vm.currentCustomer.customerOrgId).then(function (results) {
          setAllNumbers(results);
        }).catch(function (response) {
          setAllNumbers([]);
          Notification.errorResponse(response, 'partnerHomePage.errGetPhoneNumberCount');
        });
      } else {
        setAllNumbers([]);
      }
    }

    function setAllNumbers(allNumbers) {
      allNumbers = allNumbers || [];
      vm.allNumbers = allNumbers;
      ExternalNumberService.setAllNumbers(allNumbers);
      vm.allNumbersCount = allNumbers.length;
      vm.loading = false;
    }
  }
})();
