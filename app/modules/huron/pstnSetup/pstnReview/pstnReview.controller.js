(function () {
  'use strict';

  angular.module('Huron')
    .controller('PstnReviewCtrl', PstnReviewCtrl);

  /* @ngInject */
  function PstnReviewCtrl($q, $translate, $state, PstnSetup, PstnSetupService, PstnServiceAddressService, Notification, ExternalNumberPool) {
    var vm = this;

    vm.totalNewAdvancedOrder = 0;
    vm.totalPortNumbers = 0;
    vm.orders = [];
    vm.numbers = [];

    vm.goToNumbers = goToNumbers;
    vm.placeOrder = placeOrder;

    vm.provider = PstnSetup.getProvider();

    initOrders();

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
        getNumbers(vm.newOrders),
        PstnSetup.getIsTrial()
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

    function initOrders() {
      vm.orders = PstnSetup.getOrders();

      vm.portOrders = _.remove(vm.orders, function (order) {
        return _.get(order, 'type') === PstnSetupService.PORT_ORDERS;
      });

      vm.advancedOrders = _.remove(vm.orders, function (order) {
        return _.get(order, 'type') === PstnSetupService.ADVANCED_ORDERS;
      });

      vm.newOrders = vm.orders;

      if (vm.advancedOrders.length > 0 || vm.newOrders.length > 0) {
        vm.totalNewAdvancedOrder = getTotal(vm.newOrders, vm.advancedOrders);
      }

      if (vm.portOrders.length > 0) {
        vm.totalPortNumbers = _.get(vm.portOrders[0].data.numbers, 'length');
      }
    }

    function getNumbers(orders) {
      return _.chain(orders)
        .map(function (order) {
          return _.get(order, 'data.numbers');
        })
        .flatten()
        .value();
    }

    function createNumbers() {
      var promises = [];
      var errors = [];
      var promise;

      function pushErrorArray(response) {
        errors.push(Notification.processErrorResponse(response));
      }

      var numbers = getNumbers(vm.newOrders);

      if (numbers.length > 0) {
        promise = PstnSetupService.orderNumbers(PstnSetup.getCustomerId(), PstnSetup.getProviderId(), numbers)
          .catch(pushErrorArray);
        promises.push(promise);
      }

      if (vm.portOrders.length > 0) {
        promise = PstnSetupService.portNumbers(PstnSetup.getCustomerId(), PstnSetup.getProviderId(), _.get(vm, 'portOrders[0].data.numbers'))
          .catch(pushErrorArray);
        promises.push(promise);
      }

      _.forEach(vm.advancedOrders, function (order) {
        promise = PstnSetupService.orderBlock(PstnSetup.getCustomerId(), PstnSetup.getProviderId(), order.data.areaCode, order.data.length, order.data.consecutive)
          .catch(pushErrorArray);
        promises.push(promise);
      });

      return $q.all(promises).then(function () {
        if (errors.length > 0) {
          errors.splice(0, 0, $translate.instant('pstnSetup.orderNumbersError'));
          Notification.notify(errors, 'error');
        }
      });
    }

    function getTotal(newOrders, advancedOrders) {
      var total = 0;
      _.forEach(newOrders, function (order) {
        if (angular.isString(order.data.numbers)) {
          total += 1;
        } else {
          total += order.data.numbers.length;
        }
      });
      _.forEach(advancedOrders, function (order) {
        total += order.data.length;
      });
      return total;
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
