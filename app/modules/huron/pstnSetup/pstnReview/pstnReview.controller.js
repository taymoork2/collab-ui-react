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

    initNumbers();

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
        vm.newNumbers
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

    function getFlattenedNumbers(phoneNumbers) {
      return _.chain(phoneNumbers)
        .flatten()
        .map(function (phoneNumber) {
          if (_.isObject(phoneNumber)) {
            return phoneNumber.value;
          } else {
            return phoneNumber;
          }
        })
        .value();
    }

    function initNumbers() {
      var numberPartition = _.partition(PstnSetup.getNumbers(), {
        type: PstnSetupService.PORT
      });

      vm.portNumbers = getFlattenedNumbers(numberPartition[0]);
      vm.newNumbers = getFlattenedNumbers(numberPartition[1]);
    }

    function createNumbers() {
      var promises = [];
      var errors = [];
      var promise;

      function pushErrorArray(response) {
        errors.push(Notification.processErrorResponse(response));
      }

      if (vm.newNumbers.length) {
        promise = PstnSetupService.orderNumbers(PstnSetup.getCustomerId(), PstnSetup.getProviderId(), vm.newNumbers)
          .catch(pushErrorArray);
        promises.push(promise);
      }

      if (vm.portNumbers.length) {
        promise = PstnSetupService.portNumbers(PstnSetup.getCustomerId(), PstnSetup.getProviderId(), vm.portNumbers)
          .catch(pushErrorArray);
        promises.push(promise);
      }

      return $q.all(promises).then(function () {
        if (errors.length > 0) {
          errors.splice(0, 0, $translate.instant('pstnSetup.orderNumbersError'));
          Notification.notify(errors, 'error');
        }
      });
    }

    function startPlaceOrderLoad() {
      vm.placeOrderLoad = true;
    }

    function stopPlaceOrderLoad() {
      vm.placeOrderLoad = false;
    }

    function placeOrder() {
      var promise = $q.when();
      startPlaceOrderLoad();
      if (!PstnSetup.isCustomerExists()) {
        promise = promise.then(createCustomer);
      } else if (!PstnSetup.isCarrierExists()) {
        promise = promise.then(updateCustomerCarrier);
      }
      promise
        .then(createSite)
        .then(createNumbers)
        .then(goToNextSteps)
        .finally(stopPlaceOrderLoad);
    }
  }
})();
