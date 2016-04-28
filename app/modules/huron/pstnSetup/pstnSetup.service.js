(function () {
  'use strict';

  angular.module('Huron')
    .factory('PstnSetupService', PstnSetupService);

  /* @ngInject */
  function PstnSetupService($q, Authinfo, PstnSetup, TerminusCarrierService, TerminusCustomerService, TerminusCustomerCarrierService, TerminusOrderService, TerminusCarrierInventoryCount, TerminusNumberService, TerminusCarrierInventorySearch, TerminusCarrierInventoryReserve, TerminusCarrierInventoryRelease, TerminusCustomerCarrierInventoryReserve, TerminusCustomerCarrierInventoryRelease, TerminusCustomerCarrierDidService, TerminusResellerCarrierService) {
    var INTELEPEER = "INTELEPEER";
    var TATA = "TATA";
    var TELSTRA = "TELSTRA";
    var PSTN = "PSTN";
    var TYPE_PORT = "PORT";
    var PENDING = "PENDING";
    var QUEUED = "QUEUED";
    var BLOCK = 'block';
    var ORDER = 'order';
    var PORT_ORDERS = 'portOrders';
    var ADVANCED_ORDERS = 'advancedOrders';
    var NEW_ORDERS = 'newOrders';
    var BLOCK_ORDER = 'BLOCK_ORDER';

    var service = {
      createCustomer: createCustomer,
      updateCustomerCarrier: updateCustomerCarrier,
      getCustomer: getCustomer,
      listDefaultCarriers: listDefaultCarriers,
      getCarrierInventory: getCarrierInventory,
      searchCarrierInventory: searchCarrierInventory,
      reserveCarrierInventory: reserveCarrierInventory,
      releaseCarrierInventory: releaseCarrierInventory,
      isCarrierSwivel: isCarrierSwivel,
      listCustomerCarriers: listCustomerCarriers,
      listResellerCarriers: listResellerCarriers,
      orderBlock: orderBlock,
      orderNumbers: orderNumbers,
      portNumbers: portNumbers,
      listPendingOrders: listPendingOrders,
      getOrder: getOrder,
      listPendingNumbers: listPendingNumbers,
      deleteNumber: deleteNumber,
      INTELEPEER: INTELEPEER,
      TATA: TATA,
      TELSTRA: TELSTRA,
      PSTN: PSTN,
      PENDING: PENDING,
      QUEUED: QUEUED,
      BLOCK: BLOCK,
      ORDER: ORDER,
      PORT_ORDERS: PORT_ORDERS,
      ADVANCED_ORDERS: ADVANCED_ORDERS,
      NEW_ORDERS: NEW_ORDERS
    };

    return service;

    function createCustomer(uuid, name, firstName, lastName, email, pstnCarrierId, numbers, trial) {
      var payload = {
        uuid: uuid,
        name: name,
        firstName: firstName,
        lastName: lastName,
        email: email,
        pstnCarrierId: pstnCarrierId,
        numbers: numbers,
        trial: trial
      };

      if (PstnSetup.isResellerExists()) {
        payload.resellerId = Authinfo.getOrgId();
      }
      return TerminusCustomerService.save({}, payload).$promise;
    }

    function updateCustomerCarrier(customerId, pstnCarrierId) {
      var payload = {
        pstnCarrierId: pstnCarrierId
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

    function listDefaultCarriers() {
      return TerminusCarrierService.query({
        service: PSTN,
        defaultOffer: true
      }).$promise.then(getCarrierDetails);
    }

    function listResellerCarriers() {
      return TerminusResellerCarrierService.query({
        resellerId: Authinfo.getOrgId()
      }).$promise.then(getCarrierDetails);
    }

    function listCustomerCarriers(customerId) {
      return TerminusCustomerCarrierService.query({
        customerId: customerId
      }).$promise.then(getCarrierDetails);
    }

    function getCarrierDetails(carriers) {
      var promises = [];
      angular.forEach(carriers, function (carrier) {
        var promise = TerminusCarrierService.get({
          carrierId: carrier.uuid
        }).$promise;
        promises.push(promise);
      });
      return $q.all(promises);
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

    function reserveCarrierInventory(customerId, carrierId, numbers, isCustomerExists) {
      if (!angular.isArray(numbers)) {
        numbers = [numbers];
      }

      if (isCustomerExists) {
        // If a customer exists, reserve with the customer
        return TerminusCustomerCarrierInventoryReserve.save({
          customerId: customerId,
          carrierId: carrierId
        }, {
          numbers: numbers
        }).$promise;
      } else {
        // Otherwise reserve with carrier
        return TerminusCarrierInventoryReserve.save({
          carrierId: carrierId
        }, {
          numbers: numbers
        }).$promise;
      }
    }

    function releaseCarrierInventory(customerId, carrierId, numbers, isCustomerExists) {
      if (!angular.isArray(numbers)) {
        numbers = [numbers];
      }
      if (isCustomerExists) {
        // If a customer exists, release with the customer
        return TerminusCustomerCarrierInventoryRelease.save({
          customerId: customerId,
          carrierId: carrierId
        }, {
          numbers: numbers
        }).$promise;
      } else {
        // Otherwise release with carrier
        return TerminusCarrierInventoryRelease.save({
          carrierId: carrierId
        }, {
          numbers: numbers
        }).$promise;
      }
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

    function orderBlock(customerId, carrierId, npa, quantity, isSequential) {
      var payload = {
        npa: npa,
        quantity: quantity,
        sequential: isSequential
      };

      return TerminusCustomerCarrierDidService.save({
        customerId: customerId,
        carrierId: carrierId,
        type: BLOCK
      }, payload).$promise;
    }

    function orderNumbers(customerId, carrierId, numbers) {
      var payload = {
        numbers: numbers
      };

      return TerminusCustomerCarrierDidService.save({
        customerId: customerId,
        carrierId: carrierId,
        type: ORDER
      }, payload).$promise;
    }

    function portNumbers(customerId, carrierId, numbers) {
      var payload = {
        numbers: numbers
      };

      return TerminusCustomerCarrierDidService.save({
        customerId: customerId,
        carrierId: carrierId,
        type: PORT_ORDERS
      }, payload).$promise;
    }

    function listPendingOrders(customerId) {
      var pendingOrders = [];
      pendingOrders.push(
        TerminusOrderService.query({
          customerId: customerId,
          type: PSTN,
          status: PENDING
        }).$promise
      );
      pendingOrders.push(
        TerminusOrderService.query({
          customerId: customerId,
          type: TYPE_PORT,
          status: PENDING
        }).$promise
      );
      return $q.all(pendingOrders)
        .then(_.flatten);
    }

    function getOrder(customerId, orderId) {
      return TerminusOrderService.query({
        customerId: customerId,
        orderId: orderId
      }).$promise;
    }

    function listPendingNumbers(customerId) {
      var pendingNumbers = [];

      return listPendingOrders(customerId).then(function (orders) {
        var promises = [];
        _.forEach(orders, function (carrierOrder) {
          if (_.get(carrierOrder, 'operation') === BLOCK_ORDER) {
            var areaCode = getAreaCode(carrierOrder);
            try {
              var json = JSON.parse(carrierOrder.response);
            } catch (error) {
              //if parsing fails, give order number to reference possible malformed order
              pendingNumbers.push({
                orderNumber: carrierOrder.carrierOrderId
              });
              return;
            }
            var orderQuantity = json[carrierOrder.carrierOrderId].length;
            pendingNumbers.push({
              pattern: '(' + areaCode + ') XXX-XXXX',
              quantity: orderQuantity
            });
          } else {
            var promise = getOrder(customerId, carrierOrder.uuid).then(function (orderNumbers) {
              _.forEach(orderNumbers, function (orderNumber) {
                if (orderNumber && orderNumber.number && (orderNumber.network === PENDING || orderNumber.network === QUEUED)) {
                  pendingNumbers.push({
                    pattern: orderNumber.number
                  });
                }
              });
            });
            promises.push(promise);
          }
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

    function getAreaCode(order) {
      return _.chain(order).get('description').slice(-3).join('').value();
    }

  }
})();
