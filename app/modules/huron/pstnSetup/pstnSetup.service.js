(function () {
  'use strict';

  angular.module('Huron')
    .factory('PstnSetupService', PstnSetupService);

  /* @ngInject */
  function PstnSetupService($q, Authinfo, TerminusCustomerService, TerminusCustomerCarrierService, TerminusBlockOrderService, TerminusOrderService) {
    var service = {
      createCustomer: createCustomer,
      getCustomer: getCustomer,
      getCarrierId: getCarrierId,
      orderBlock: orderBlock,
      listPendingOrders: listPendingOrders,
      getOrder: getOrder,
      listPendingNumbers: listPendingNumbers
    };

    var INTELEPEER = "INTELEPEER";
    var TATA = "TATA";
    var PSTN = "PSTN";
    var PENDING = "PENDING";

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
      "serviceAddressSub": "",
      "serviceCity": "Richardson",
      "serviceState": "TX",
      "serviceZip": "75082"
    };

    return service;

    function createCustomer(uuid, name, partnerUuid) {
      var payload = {
        "uuid": uuid,
        "name": name,
        "reseller": partnerUuid || Authinfo.getOrgId(),
        "billingAddress": billingAddress
      };
      return TerminusCustomerService.save({}, payload).$promise;
    }

    function getCustomer(customerId) {
      return TerminusCustomerService.get({
        customerId: customerId
      }).$promise;
    }

    function getCarrierId(customerId, carrierName) {
      return TerminusCustomerCarrierService.query({
        customerId: customerId
      }).$promise.then(function (carriers) {
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

    function listPendingOrders(customerId) {
      return TerminusOrderService.query({
        customerId: customerId,
        type: PSTN,
        status: PENDING
      }).$promise;
    }

    function getOrder(customerId, orderId) {
      return TerminusOrderService.get({
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
          var promise = getOrder(customerId, carrierOrder.uuid).then(function (order) {
            angular.forEach(order, function (value, key) {
              if (key != null && value.status === PENDING) {
                pendingNumbers.push(value.number);
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

  }
})();
