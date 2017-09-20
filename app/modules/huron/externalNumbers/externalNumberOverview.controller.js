(function () {
  'use strict';

  angular.module('Huron')
    .controller('ExternalNumberOverviewCtrl', ExternalNumberOverview);

  /* @ngInject */
  function ExternalNumberOverview($scope, $state, $stateParams, ExternalNumberService, Notification, ExternalNumberPool, FeatureToggleService) {
    var vm = this;
    vm.currentCustomer = $stateParams.currentCustomer;
    vm.loading = true;
    vm.allNumbersCount = 0;
    vm.isTerminusCustomer = isTerminusCustomer;
    vm.callAction = [{
      actionKey: 'customerPage.addNumbers',
      actionFunction: isTerminusCustomer,
    }];
    var ALL = 'all';

    FeatureToggleService.supports(FeatureToggleService.features.huronPstn).then(function (results) {
      vm.hPstn = results;
    });
    updatePhoneNumberCount();

    $scope.$watchCollection(function () {
      return ExternalNumberService.getAllNumbers();
    }, function () {
      vm.allNumbersCount = ExternalNumberService.getQuantity(ALL);
    });

    function updatePhoneNumberCount() {
      if (vm.currentCustomer && vm.currentCustomer.customerOrgId) {
        ExternalNumberService.refreshNumbers(vm.currentCustomer.customerOrgId, ExternalNumberPool.ALL_EXTERNAL_NUMBER_TYPES)
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
          var state = vm.hPstn ? 'pstnWizard' : 'pstnSetup';
          return $state.go(state, {
            customerId: vm.currentCustomer.customerOrgId,
            customerName: vm.currentCustomer.customerName,
            customerEmail: vm.currentCustomer.customerEmail,
            customerCommunicationLicenseIsTrial: getCommTrial(vm.currentCustomer, 'communications'),
            customerRoomSystemsLicenseIsTrial: getCommTrial(vm.currentCustomer, 'roomSystems'),
          });
        } else {
          return Notification.error('pstnSetup.errors.customerNotFound');
        }
      });
    }

    function getCommTrial(org, type) {
      if (org.isPartner) {
        return false;
      }
      return _.get(org, type + '.isTrial', true);
    }
  }
})();
