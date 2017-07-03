(function () {
  'use strict';

  angular.module('Huron')
    .controller('PstnReviewCtrl', PstnReviewCtrl);

  /* @ngInject */
  function PstnReviewCtrl($q, $translate, $state, $stateParams, PstnModel, PstnService, PstnServiceAddressService, Notification, Auth) {
    var vm = this;
    var NUMBER_ORDER = require('modules/huron/pstn').NUMBER_ORDER;
    var BLOCK_ORDER = require('modules/huron/pstn').BLOCK_ORDER;
    var NUMTYPE_TOLLFREE = require('modules/huron/pstn').NUMTYPE_TOLLFREE;
    var SWIVEL_ORDER = require('modules/huron/pstn').SWIVEL_ORDER;
    var NUMTYPE_DID = require('modules/huron/pstn').NUMTYPE_DID;
    var PORT_ORDER = require('modules/huron/pstn').PORT_ORDER;

    vm.totalNewAdvancedOrder = 0;
    vm.totalPortNumbers = 0;
    vm.orders = [];
    vm.numbers = [];

    vm.goToNumbers = goToNumbers;
    vm.placeOrder = placeOrder;
    vm.refreshFn = refreshFn;

    vm.provider = PstnModel.getProvider();

    initOrders();

    ////////////////////////

    function goToNumbers() {
      if (vm.provider.apiImplementation !== 'SWIVEL') {
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
        portOrders: vm.portOrders,
      });
    }

    function createCustomerV2() {
      return Auth.getCustomerAccount(PstnModel.getCustomerId()).then(function (org) {
        var isTrial = isTrialCallOrRoom(_.get(org, 'data.customers[0]'));

        return PstnService.createCustomerV2(
          PstnModel.getCustomerId(),
          PstnModel.getCustomerName(),
          PstnModel.getCustomerFirstName(),
          PstnModel.getCustomerLastName(),
          PstnModel.getCustomerEmail(),
          PstnModel.getProviderId(),
          isTrial
        ).catch(function (response) {
          Notification.errorResponse(response, 'PstnModel.customerCreateError');
          return $q.reject(response);
        });
      });
    }

    function updateCustomerCarrier() {
      return PstnService.updateCustomerCarrier(PstnModel.getCustomerId(), PstnModel.getProviderId())
        .then(function () {
          PstnModel.setCarrierExists(true);
        }).catch(function (response) {
          Notification.errorResponse(response, 'pstnSetup.customerUpdateError');
          return $q.reject(response);
        });
    }

    function createSite() {
      // Only create site for API providers
      if (vm.provider.apiImplementation !== 'SWIVEL' && !PstnModel.isSiteExists()) {
        return PstnServiceAddressService.createCustomerSite(PstnModel.getCustomerId(), PstnModel.getCustomerName(), PstnModel.getServiceAddress())
          .then(function () {
            PstnModel.setSiteExists(true);
          }).catch(function (response) {
            Notification.errorResponse(response, 'pstnSetup.siteCreateError');
            return $q.reject(response);
          });
      }
    }

    function initOrders() {
      vm.orders = PstnModel.getOrders();

      vm.portOrders = _.remove(vm.orders, function (order) {
        return _.get(order, 'orderType') === PORT_ORDER;
      });

      vm.newTollFreeOrders = _.remove(vm.orders, function (order) {
        return _.get(order, 'orderType') === NUMBER_ORDER && _.get(order, 'numberType') === NUMTYPE_TOLLFREE;
      });

      var pstnAdvancedOrders = _.remove(vm.orders, function (order) {
        return _.get(order, 'orderType') === BLOCK_ORDER && _.get(order, 'numberType') === NUMTYPE_DID;
      });

      vm.swivelOrders = _.remove(vm.orders, function (order) {
        return _.get(order, 'orderType') === SWIVEL_ORDER;
      });

      var tollFreeAdvancedOrders = _.remove(vm.orders, function (order) {
        return _.get(order, 'orderType') === BLOCK_ORDER && _.get(order, 'numberType') === NUMTYPE_TOLLFREE;
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
        promise = PstnService.orderNumbersV2(PstnModel.getCustomerId(), vm.newOrders)
          .catch(pushErrorArray);
        promises.push(promise);
      }

      if (vm.newTollFreeOrders.length > 0) {
        promise = PstnService.orderNumbersV2(PstnModel.getCustomerId(), vm.newTollFreeOrders)
          .catch(pushErrorArray);
        promises.push(promise);
      }

      if (vm.portOrders.length > 0) {
        promise = PstnService.portNumbers(PstnModel.getCustomerId(), PstnModel.getProviderId(), _.get(vm, 'portOrders[0].data.numbers'))
          .catch(pushErrorArray);
        promises.push(promise);
      }

      if (vm.swivelOrders.length > 0) {
        promise = PstnService.orderNumbers(PstnModel.getCustomerId(), PstnModel.getProviderId(), _.get(vm, 'swivelOrders[0].data.numbers'))
          .catch(pushErrorArray);
        promises.push(promise);
      }

      _.forEach(vm.advancedOrders, function (order) {
        if (_.get(order, 'orderType') === BLOCK_ORDER && _.get(order, 'numberType') === NUMTYPE_DID) {
          promise = PstnService.orderBlock(PstnModel.getCustomerId(), PstnModel.getProviderId(), order.data.areaCode, order.data.length, order.data.consecutive, order.data.nxx)
            .catch(pushErrorArray);
        } else if (_.get(order, 'orderType') === BLOCK_ORDER && _.get(order, 'numberType') === NUMTYPE_TOLLFREE) {
          promise = PstnService.orderTollFreeBlock(PstnModel.getCustomerId(), PstnModel.getProviderId(), order.data.areaCode, order.data.length)
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

    function refreshFn() {
      if (_.isUndefined($stateParams.refreshFn)) {
        return $q.resolve(true);
      } else {
        return $stateParams.refreshFn();
      }
    }

    function placeOrder() {
      var promise = $q.resolve();
      startPlaceOrderLoad();
      if (!PstnModel.isCustomerExists()) {
        promise = promise.then(createCustomerV2);
      } else if (!PstnModel.isCarrierExists()) {
        promise = promise.then(updateCustomerCarrier);
      }
      promise
        .then(createSite)
        .then(createNumbers)
        .then(refreshFn)
        .then(goToNextSteps)
        .finally(stopPlaceOrderLoad);
    }

    function isTrialCallOrRoom(customer) {
      var isPaid = _.find(customer.licenses, function (license) {
        return (license.licenseType === 'COMMUNICATION' && !license.isTrial) || (license.licenseType === 'SHARED_DEVICES' && !license.isTrial);
      });

      return _.isUndefined(isPaid);
    }
  }
})();
