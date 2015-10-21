(function () {
  'use strict';

  angular.module('Huron')
    .factory('PstnSetupService', PstnSetupService);

  /* @ngInject */
  function PstnSetupService($q, Authinfo, TerminusCarrierService, TerminusCustomerService, TerminusCustomerCarrierService, TerminusBlockOrderService, TerminusOrderService, TerminusCarrierInventoryCount, TerminusNumberService, TerminusCarrierInventorySearch, TerminusCarrierInventoryReserve, TerminusCarrierInventoryRelease, TerminusNumberOrderService) {
    var INTELEPEER = "INTELEPEER";
    var TATA = "TATA";
    var PSTN = "PSTN";
    var PENDING = "PENDING";
    var QUEUED = "QUEUED";

    var service = {
      createCustomer: createCustomer,
      updateCustomerCarrier: updateCustomerCarrier,
      getCustomer: getCustomer,
      listCarriers: listCarriers,
      getCarrierInventory: getCarrierInventory,
      searchCarrierInventory: searchCarrierInventory,
      reserveCarrierInventory: reserveCarrierInventory,
      releaseCarrierInventory: releaseCarrierInventory,
      isCarrierSwivel: isCarrierSwivel,
      listCustomerCarriers: listCustomerCarriers,
      getCarrierId: getCarrierId,
      orderBlock: orderBlock,
      orderNumbers: orderNumbers,
      listPendingOrders: listPendingOrders,
      getOrder: getOrder,
      listPendingNumbers: listPendingNumbers,
      deleteNumber: deleteNumber,
      INTELEPEER: INTELEPEER,
      TATA: TATA,
      PSTN: PSTN,
      PENDING: PENDING
    };

    var billingAddress = {
      "billingName": "Cisco Systems",
      "billingStreetNumber": "2200",
      "billingStreetDirectional": "E",
      "billingStreetName": "President George Bush",
      "billingStreetSuffix": "Hwy",
      "billingAddressSub": "",
      "billingCity": "Richardson",
      "billingState": "TX",
      "billingZip": "75082"
    };

    var blockOrderPayload = {
      "serviceName": "Cisco Systems",
      "serviceStreetNumber": "2200",
      "serviceStreetDirectional": "E",
      "serviceStreetName": "President George Bush",
      "serviceStreetSuffix": "Hwy",
      "serviceCity": "Richardson",
      "serviceState": "TX",
      "serviceZip": "75082"
    };

    return service;

    function createCustomer(uuid, name, pstnCarrierId, partnerUuid) {
      var payload = {
        "uuid": uuid,
        "name": name,
        "pstnCarrierId": pstnCarrierId,
        "resellerId": partnerUuid || Authinfo.getOrgId(),
        "billingAddress": billingAddress
      };
      return TerminusCustomerService.save({}, payload).$promise;
    }

    function updateCustomerCarrier(customerId, pstnCarrierId) {
      var payload = {
        "pstnCarrierId": pstnCarrierId
      };
      return TerminusCustomerService.update({
        customerId: customerId
      }, payload).$promise;
    }

    function getCustomer(customerId) {
      return TerminusCustomerService.get({
        customerId: customerId
      }).$promise;
    }

    function listCarriers() {
      return TerminusCarrierService.query().$promise;
    }

    function listCustomerCarriers(customerId) {
      return TerminusCustomerCarrierService.query({
        customerId: customerId
      }).$promise;
    }

    function getCarrierInventory(carrierId, state) {
      return TerminusCarrierInventoryCount.get({
        carrierId: carrierId,
        state: state
      }).$promise;
    }

    function searchCarrierInventory(carrierId, params) {
      var paramObj = params || {};
      paramObj.carrierId = carrierId;
      return TerminusCarrierInventorySearch.get(paramObj).$promise
        .then(function (response) {
          return response.numbers || [];
        });
    }

    function reserveCarrierInventory(carrierId, numbers) {
      if (!angular.isArray(numbers)) {
        numbers = [numbers];
      }
      return TerminusCarrierInventoryReserve.save({
        carrierId: carrierId
      }, {
        numbers: numbers
      }).$promise;
    }

    function releaseCarrierInventory(carrierId, numbers) {
      if (!angular.isArray(numbers)) {
        numbers = [numbers];
      }
      return TerminusCarrierInventoryRelease.save({
        carrierId: carrierId
      }, {
        numbers: numbers
      }).$promise;
    }

    function isCarrierSwivel(customerId) {
      return listCustomerCarriers(customerId).then(function (carriers) {
        if (angular.isArray(carriers)) {
          var carrier = _.findWhere(carriers, {
            name: TATA
          });
          if (carrier) {
            return true;
          }
        }
        return false;
      });
    }

    function getCarrierId(customerId, carrierName) {
      return listCustomerCarriers(customerId).then(function (carriers) {
        var matchingCarriers = carriers.filter(function (carrier) {
          return carrier.name === (carrierName || INTELEPEER);
        });
        if (matchingCarriers.length > 0) {
          return matchingCarriers[0].uuid;
        } else {
          return $q.reject('carrier not found');
        }
      });
    }

    function orderBlock(customerId, carrierId, npa, quantity) {
      var payload = angular.copy(blockOrderPayload);
      payload.npa = npa;
      payload.quantity = quantity;

      return TerminusBlockOrderService.save({
        customerId: customerId,
        carrierId: carrierId
      }, payload).$promise;
    }

    function orderNumbers(customerId, carrierId, numbers) {
      var payload = angular.copy(blockOrderPayload);
      payload.numbers = numbers;

      return TerminusNumberOrderService.save({
        customerId: customerId,
        carrierId: carrierId
      }, payload).$promise;
    }

    function listPendingOrders(customerId) {
      return TerminusOrderService.query({
        customerId: customerId,
        type: PSTN,
        status: PENDING
      }).$promise;
    }

    function getOrder(customerId, orderId) {
      return TerminusOrderService.query({
        customerId: customerId,
        orderId: orderId
      }).$promise;
    }

    function listPendingNumbers(customerId, carrier) {
      var pendingNumbers = [];

      return listPendingOrders(customerId).then(function (orders) {
        var carrierOrders = orders.filter(function (order) {
          return order.carrier === carrier;
        });
        var promises = [];
        angular.forEach(carrierOrders, function (carrierOrder) {
          var promise = getOrder(customerId, carrierOrder.uuid).then(function (orderNumbers) {
            angular.forEach(orderNumbers, function (orderNumber) {
              if (orderNumber && orderNumber.number && (orderNumber.network === PENDING || orderNumber.network === QUEUED)) {
                pendingNumbers.push({
                  pattern: orderNumber.number
                });
              }
            });
          });
          promises.push(promise);
        });

        return $q.all(promises).then(function () {
          return pendingNumbers;
        });
      });
    }

    function deleteNumber(customerId, number) {
      return TerminusNumberService.delete({
        customerId: customerId,
        did: number
      }).$promise;
    }

  }
})();
