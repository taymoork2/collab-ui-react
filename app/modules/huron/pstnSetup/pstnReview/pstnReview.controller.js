(function () {
  'use strict';

  angular.module('Huron')
    .controller('PstnReviewCtrl', PstnReviewCtrl);

  /* @ngInject */
  function PstnReviewCtrl($q, $translate, $state, PstnSetup, PstnSetupService, Notification, ExternalNumberPool) {
    var vm = this;

    vm.goToNumbers = goToNumbers;
    vm.placeOrder = placeOrder;

    vm.provider = PstnSetup.getProvider();
    vm.numbers = _.flatten(PstnSetup.getNumbers());

    ////////////////////////

    function goToNumbers() {
      if (vm.provider.apiExists) {
        goToOrderNumbers();
      } else {
        goToSwivelNumbers();
      }
    }

    function goToSwivelNumbers() {
      $state.go('pstnSetup.swivelNumbers');
    }

    function goToOrderNumbers() {
      $state.go('pstnSetup.orderNumbers');
    }

    function goToNextSteps() {
      $state.go('pstnSetup.nextSteps');
    }

    function createCustomer() {
      return PstnSetupService.createCustomer(PstnSetup.getCustomerId(), PstnSetup.getCustomerName(), PstnSetup.getProviderId())
        .then(function () {
          PstnSetup.setCustomerExists(true);
        }).catch(function (response) {
          Notification.errorResponse(response, 'pstnSetup.customerCreateError');
          return $q.reject(response);
        });
    }

    function updateCustomerCarrier() {
      return PstnSetupService.updateCustomerCarrier(PstnSetup.getCustomerId(), PstnSetup.getProviderId())
        .then(function () {
          PstnSetup.setCarrierExists(true);
        }).catch(function (response) {
          Notification.errorResponse(response, 'pstnSetup.customerUpdateError');
          return $q.reject(response);
        });
    }

    function createNumbers() {
      var promises = [];
      var errors = [];
      var numbers = [];

      if (vm.provider.apiExists) {
        numbers = vm.numbers;
      } else {
        _.forEach(vm.numbers, function (numberToken) {
          numbers.push(numberToken.value);
        });
      }

      var promise = PstnSetupService.orderNumbers(PstnSetup.getCustomerId(), PstnSetup.getProviderId(), numbers)
        .catch(function (response) {
          errors.push(Notification.processErrorResponse(response, 'pstnSetup.orderNumbersError'));
        });
      promises.push(promise);
      return $q.all(promises).then(function () {
        if (errors.length > 0) {
          Notification.notify(errors, 'error');
        }
      });
    }

    function placeOrder() {
      var promise = $q.when();
      vm.placeOrderLoad = true;
      if (!PstnSetup.isCustomerExists()) {
        promise = promise.then(createCustomer);
      } else if (!PstnSetup.isCarrierExists()) {
        promise = promise.then(updateCustomerCarrier);
      }
      promise.then(createNumbers)
        .then(goToNextSteps)
        .finally(function () {
          vm.placeOrderLoad = false;
        });
    }
  }
})();
