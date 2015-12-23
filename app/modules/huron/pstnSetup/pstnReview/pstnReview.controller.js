(function () {
  'use strict';

  angular.module('Huron')
    .controller('PstnReviewCtrl', PstnReviewCtrl);

  /* @ngInject */
  function PstnReviewCtrl($q, $translate, $state, PstnSetup, PstnSetupService, PstnServiceAddressService, Notification, ExternalNumberPool) {
    var vm = this;

    vm.goToNumbers = goToNumbers;
    vm.placeOrder = placeOrder;

    vm.provider = PstnSetup.getProvider();
    vm.numbers = initNumbers();

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
      return PstnSetupService.createCustomer(
        PstnSetup.getCustomerId(),
        PstnSetup.getCustomerName(),
        PstnSetup.getCustomerFirstName(),
        PstnSetup.getCustomerLastName(),
        PstnSetup.getCustomerEmail(),
        PstnSetup.getProviderId(),
        vm.numbers
      ).then(function () {
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

    function createSite() {
      // Only create site for API providers
      if (vm.provider.apiExists && !PstnSetup.isSiteExists()) {
        return PstnServiceAddressService.createCustomerSite(PstnSetup.getCustomerId(), PstnSetup.getCustomerName(), PstnSetup.getServiceAddress())
          .then(function () {
            PstnSetup.setSiteExists(true);
          }).catch(function (response) {
            Notification.errorResponse(response, 'pstnSetup.siteCreateError');
            return $q.reject(response);
          });
      }
    }

    function initNumbers() {
      var numbers = _.flatten(PstnSetup.getNumbers());

      if (vm.provider.apiExists) {
        return numbers;
      } else {
        return _.map(numbers, 'value');
      }
    }

    function createNumbers() {
      var promises = [];
      var errors = [];

      var promise = PstnSetupService.orderNumbers(PstnSetup.getCustomerId(), PstnSetup.getProviderId(), vm.numbers)
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
      promise
        .then(createSite)
        .then(createNumbers)
        .then(goToNextSteps)
        .finally(function () {
          vm.placeOrderLoad = false;
        });
    }
  }
})();
