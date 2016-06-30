(function () {
  'use strict';

  angular.module('Huron')
    .factory('ExternalNumberService', ExternalNumberService);

  /* @ngInject */
  function ExternalNumberService($q, $translate, ExternalNumberPool, NumberSearchServiceV2, PstnSetupService, TelephoneNumberService) {
    var service = {
      refreshNumbers: refreshNumbers,
      clearNumbers: clearNumbers,
      setAllNumbers: setAllNumbers,
      getAllNumbers: getAllNumbers,
      getAssignedNumbers: getAssignedNumbers,
      getPendingNumbers: getPendingNumbers,
      getPendingOrders: getPendingOrders,
      getUnassignedNumbers: getUnassignedNumbers,
      getUnassignedNumbersWithoutPending: getUnassignedNumbersWithoutPending,
      deleteNumber: deleteNumber,
      isTerminusCustomer: isTerminusCustomer,
      getPendingOrderQuantity: getPendingOrderQuantity,
      getQuantity: getQuantity
    };
    var allNumbers = [];
    var pendingNumbers = [];
    var unassignedNumbers = [];
    var terminusDetails = [];
    var pendingOrders = [];
    var assignedNumbers = [];

    var ALL = 'all';
    var PENDING = 'pending';
    var UNASSIGNED = 'unassigned';

    return service;

    function refreshNumbers(customerId) {
      return isTerminusCustomer(customerId)
        .then(function (isSupported) {
          if (isSupported) {
            return PstnSetupService.listPendingNumbers(customerId)
              .then(formatNumberLabels)
              .then(function (numbers) {
                var tempOrders = [];
                var tempNumbers = [];
                _.forEach(numbers, function (number) {
                  if (_.has(number, 'orderNumber') || _.has(number, 'quantity')) {
                    tempOrders.push(number);
                  } else {
                    tempNumbers.push(number);
                  }
                });
                pendingOrders = tempOrders;
                pendingNumbers = tempNumbers;
              })
              .catch(function (response) {
                pendingNumbers = [];
                pendingOrders = [];
                if (!response || response.status !== 404) {
                  return $q.reject(response);
                }
              });
          } else {
            pendingNumbers = [];
            pendingOrders = [];
          }
        })
        .then(function () {
          return ExternalNumberPool.getAll(customerId)
            .then(formatNumberLabels)
            .then(function (numbers) {
              unassignedNumbers = filterUnassigned(numbers);
              assignedNumbers = filterAssigned(numbers);
              allNumbers = pendingNumbers.concat(getNumbersWithoutPending(numbers));
            });
        })
        .catch(function (response) {
          clearNumbers();
          return $q.reject(response);
        });
    }

    function deleteNumber(customerId, number) {
      return isTerminusCustomer(customerId)
        .then(function (isSupported) {
          if (isSupported) {
            return PstnSetupService.deleteNumber(customerId, number.pattern);
          } else {
            return ExternalNumberPool.deletePool(customerId, number.uuid);
          }
        });
    }

    function clearNumbers() {
      allNumbers = [];
      pendingNumbers = [];
      unassignedNumbers = [];
      pendingOrders = [];
      assignedNumbers = [];
    }

    function formatNumberLabels(numbers) {
      _.forEach(numbers, function (number) {
        if (_.has(number, 'quantity')) {
          number.label = number.pattern + ' ' + $translate.instant('pstnSetup.quantity') + ': ' + number.quantity;
        } else if (_.has(number, 'orderNumber')) {
          number.label = $translate.instant('pstnSetup.orderNumber') + ' ' + number.orderNumber;
        } else {
          number.label = TelephoneNumberService.getDIDLabel(number.pattern);
        }
      });
      return numbers;
    }

    function filterUnassigned(numbers) {
      // return numbers that do not contain a directoryNumber
      return _.reject(numbers, 'directoryNumber');
    }

    function filterPending(numbers) {
      // return numbers that do not contain a uuid
      return _.reject(numbers, 'uuid');
    }

    function filterAssigned(numbers) {
      return _.filter(numbers, 'directoryNumber');
    }

    function setAllNumbers(_allNumbers) {
      allNumbers = _allNumbers || [];
      unassignedNumbers = filterUnassigned(allNumbers);
      pendingNumbers = filterPending(allNumbers);
      assignedNumbers = filterAssigned(allNumbers);
    }

    function getAllNumbers() {
      return allNumbers;
    }

    function getAssignedNumbers() {
      return assignedNumbers;
    }

    function getPendingNumbers() {
      return pendingNumbers;
    }

    function getPendingOrders() {
      return pendingOrders;
    }

    function getUnassignedNumbers() {
      return unassignedNumbers;
    }

    function getUnassignedNumbersWithoutPending() {
      return getNumbersWithoutPending(unassignedNumbers);
    }

    // unable to use _.differenceBy yet
    function getNumbersWithoutPending(numbersArray) {
      return _.reject(numbersArray, function (numberObj) {
        return _.some(pendingNumbers, {
          pattern: numberObj.pattern
        });
      });
    }

    function isTerminusCustomer(customerId) {
      if (_.find(terminusDetails, 'customerId', customerId)) {
        return $q.resolve(true);
      }
      return PstnSetupService.getCustomer(customerId)
        .then(_.partial(allowPstnSetup, customerId))
        .catch(_.partial(hasExternalNumbers, customerId));
    }

    function hasExternalNumbers(customerId) {
      return NumberSearchServiceV2.get({
        customerId: customerId,
        type: 'external'
      }).$promise.then(function (response) {
        if (_.get(response, 'numbers.length') !== 0) {
          return false;
        } else {
          return allowPstnSetup(customerId);
        }
      });
    }

    function allowPstnSetup(customerId) {
      terminusDetails.push({
        customerId: customerId
      });
      return true;
    }

    function getPendingOrderQuantity() {
      return _.sum(getPendingOrders(), 'quantity');
    }

    function getQuantity(type) {
      switch (type) {
      case ALL:
        return getAllNumbers().length + getPendingOrderQuantity();
      case PENDING:
        return getPendingNumbers().length + getPendingOrderQuantity();
      case UNASSIGNED:
        return getUnassignedNumbersWithoutPending().length;
      default:
        break;
      }
    }
  }
})();
