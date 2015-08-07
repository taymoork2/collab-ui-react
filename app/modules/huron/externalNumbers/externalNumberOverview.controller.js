(function () {
  'use strict';

  angular.module('Huron')
    .controller('ExternalNumberOverviewCtrl', ExternalNumberOverview);

  /* @ngInject */
  function ExternalNumberOverview($scope, $stateParams, ExternalNumberPool, Notification) {
    var vm = this;
    vm.currentCustomer = $stateParams.currentCustomer;
    vm.noOfPhoneNumbers = 0;

    updatePhoneNumberCount();

    $scope.$on('DIDS_UPDATED', function () {
      updatePhoneNumberCount();
    });

    function updatePhoneNumberCount() {
      if (vm.currentCustomer && vm.currentCustomer.customerOrgId) {
        ExternalNumberPool.getAll(vm.currentCustomer.customerOrgId).then(function (results) {
          if (angular.isArray(results) && results.length >= 0) {
            vm.noOfPhoneNumbers = results.length;
          }
        }).catch(function (response) {
          vm.noOfPhoneNumbers = 0;
          Notification.errorResponse(response, 'partnerHomePage.errGetPhoneNumberCount');
        });
      } else {
        vm.noOfPhoneNumbers = 0;
      }
    }
  }
})();
