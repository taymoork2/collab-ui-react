(function () {
  'use strict';

  angular.module('Huron')
    .factory('PstnSetupService', PstnSetupService);

  /* @ngInject */
  function PstnSetupService($q, $translate, Authinfo, PstnSetup, TerminusCarrierService, TerminusCustomerService, TerminusCustomerCarrierService, TerminusOrderService, TerminusCarrierInventoryCount, TerminusNumberService, TerminusCarrierInventorySearch, TerminusCarrierInventoryReserve, TerminusCarrierInventoryRelease, TerminusCustomerCarrierInventoryReserve, TerminusCustomerCarrierInventoryRelease, TerminusCustomerCarrierDidService, TerminusResellerCarrierService) {
    //Providers
    var INTELEPEER = "INTELEPEER";
    var TATA = "TATA";
    var TELSTRA = "TELSTRA";
    //e911 order operations
    var UPDATE = 'UPDATE';
    var DELETE = 'DELETE';
    var ADD = 'ADD';
    //did order status
    var PENDING = 'PENDING';
    var PROVISIONED = 'PROVISIONED';
    var QUEUED = "QUEUED";
    //did order types
    var NUMBER_ORDER = 'NUMBER_ORDER';
    var PORT_ORDER = 'PORT_ORDER';
    var BLOCK_ORDER = 'BLOCK_ORDER';
    //translated order status
    var SUCCESSFUL = $translate.instant('pstnOrderOverview.successful');
    var IN_PROGRESS = $translate.instant('pstnOrderOverview.inProgress');
    //translated order type
    var ADVANCE_ORDER = $translate.instant('pstnOrderOverview.advanceOrder');
    var NEW_NUMBER_ORDER = $translate.instant('pstnOrderOverview.newNumberOrder');
    var PORT_NUMBER_ORDER = $translate.instant('pstnOrderOverview.portNumberOrder');
    //$resource constants
    var BLOCK = 'block';
    var ORDER = 'order';
    var PORT = 'port';
    //misc
    var PSTN = "PSTN";
    var TYPE_PORT = "PORT";

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
      getFormattedNumberOrders: getFormattedNumberOrders,
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
      PORT_ORDER: PORT_ORDER,
      BLOCK_ORDER: BLOCK_ORDER,
      NUMBER_ORDER: NUMBER_ORDER
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
        type: PORT
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

    function getFormattedNumberOrders(customerId) {
      return TerminusOrderService.query({
        customerId: customerId
      }).$promise.then(function (response) {
        return _.chain(response)
          .map(function (order) {
            if (order.operation != UPDATE && order.operation != DELETE && order.operation != ADD) {
              var newOrder = {
                carrierOrderId: _.get(order, 'carrierOrderId'),
                response: _.get(order, 'response'),
                operation: _.get(order, 'operation')
              };
              //translate order status
              if (order.status === PROVISIONED) {
                newOrder.status = SUCCESSFUL;
              } else if (order.status === PENDING) {
                newOrder.status = IN_PROGRESS;
              }
              //translate order type
              if (order.operation === BLOCK_ORDER) {
                newOrder.type = ADVANCE_ORDER;
              } else if (order.operation === NUMBER_ORDER) {
                newOrder.type = NEW_NUMBER_ORDER;
              } else if (order.operation === PORT_ORDER) {
                newOrder.type = PORT_NUMBER_ORDER;
              }
              //create sort date and translate creation date
              var orderDate = new Date(order.created);
              newOrder.sortDate = orderDate.getTime();
              newOrder.created = orderDate.getMonth() + '/' + orderDate.getDate() + '/' + orderDate.getFullYear();

              return newOrder;
            }
          })
          .compact()
          .value();
      });
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
