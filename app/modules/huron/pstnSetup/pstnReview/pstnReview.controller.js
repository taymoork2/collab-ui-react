(function () {
  'use strict';

  angular.module('Huron')
    .controller('PstnReviewCtrl', PstnReviewCtrl);

  /* @ngInject */
  function PstnReviewCtrl($q, $translate, $state, PstnSetup, PstnSetupService, PstnServiceAddressService, Notification) {
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
      if (vm.provider.apiImplementation !== "SWIVEL") {
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
      $state.go('pstnSetup.nextSteps', {
        portOrders: vm.portOrders
      });
    }

    function createCustomerV2() {
      return PstnSetupService.createCustomerV2(
        PstnSetup.getCustomerId(),
        PstnSetup.getCustomerName(),
        PstnSetup.getCustomerFirstName(),
        PstnSetup.getCustomerLastName(),
        PstnSetup.getCustomerEmail(),
        PstnSetup.getProviderId(),
        PstnSetup.getIsTrial()
      ).catch(function (response) {
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
      if (vm.provider.apiImplementation !== "SWIVEL" && !PstnSetup.isSiteExists()) {
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
        return _.get(order, 'orderType') === PstnSetupService.PORT_ORDER;
      });

      vm.newTollFreeOrders = _.remove(vm.orders, function (order) {
        return _.get(order, 'orderType') === PstnSetupService.NUMBER_ORDER && _.get(order, 'numberType') === PstnSetupService.NUMTYPE_TOLLFREE;
      });

      var pstnAdvancedOrders = _.remove(vm.orders, function (order) {
        return _.get(order, 'orderType') === PstnSetupService.BLOCK_ORDER && _.get(order, 'numberType') === PstnSetupService.NUMTYPE_DID;
      });

      vm.swivelOrders = _.remove(vm.orders, function (order) {
        return _.get(order, 'orderType') === PstnSetupService.SWIVEL_ORDER;
      });

      var tollFreeAdvancedOrders = _.remove(vm.orders, function (order) {
        return _.get(order, 'orderType') === PstnSetupService.BLOCK_ORDER && _.get(order, 'numberType') === PstnSetupService.NUMTYPE_TOLLFREE;
      });
      vm.advancedOrders = [].concat(pstnAdvancedOrders, tollFreeAdvancedOrders);

      vm.newOrders = vm.orders;

      if (vm.advancedOrders.length > 0 || vm.newOrders.length > 0) {
        vm.totalNewAdvancedOrder = getTotal(vm.newOrders, vm.advancedOrders);
      }

      if (vm.portOrders.length > 0) {
        vm.totalPortNumbers = _.get(vm.portOrders[0].data.numbers, 'length');
      }
    }

    function createNumbers() {
      var promises = [];
      var errors = [];
      var promise;

      function pushErrorArray(response) {
        errors.push(Notification.processErrorResponse(response));
      }

      if (vm.newOrders.length > 0) {
        promise = PstnSetupService.orderNumbersV2(PstnSetup.getCustomerId(), vm.newOrders)
          .catch(pushErrorArray);
        promises.push(promise);
      }

      if (vm.newTollFreeOrders.length > 0) {
        promise = PstnSetupService.orderNumbersV2(PstnSetup.getCustomerId(), vm.newTollFreeOrders)
          .catch(pushErrorArray);
        promises.push(promise);
      }

      if (vm.portOrders.length > 0) {
        promise = PstnSetupService.portNumbers(PstnSetup.getCustomerId(), PstnSetup.getProviderId(), _.get(vm, 'portOrders[0].data.numbers'))
          .catch(pushErrorArray);
        promises.push(promise);
      }

      if (vm.swivelOrders.length > 0) {
        promise = PstnSetupService.orderNumbers(PstnSetup.getCustomerId(), PstnSetup.getProviderId(), _.get(vm, 'swivelOrders[0].data.numbers'))
          .catch(pushErrorArray);
        promises.push(promise);
      }

      _.forEach(vm.advancedOrders, function (order) {
        if (_.get(order, 'orderType') === PstnSetupService.BLOCK_ORDER && _.get(order, 'numberType') === PstnSetupService.NUMTYPE_DID) {
          promise = PstnSetupService.orderBlock(PstnSetup.getCustomerId(), PstnSetup.getProviderId(), order.data.areaCode, order.data.length, order.data.consecutive, order.data.nxx)
            .catch(pushErrorArray);
        } else if (_.get(order, 'orderType') === PstnSetupService.BLOCK_ORDER && _.get(order, 'numberType') === PstnSetupService.NUMTYPE_TOLLFREE) {
          promise = PstnSetupService.orderTollFreeBlock(PstnSetup.getCustomerId(), PstnSetup.getProviderId(), order.data.areaCode, order.data.length)
            .catch(pushErrorArray);
        }
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
        if (_.isString(order.data.numbers)) {
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
      var promise = $q.resolve();
      startPlaceOrderLoad();
      if (!PstnSetup.isCustomerExists()) {
        promise = promise.then(createCustomerV2);
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
