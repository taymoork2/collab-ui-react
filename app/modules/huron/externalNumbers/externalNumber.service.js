(function () {
  'use strict';

  angular.module('Huron')
    .factory('ExternalNumberService', ExternalNumberService);

  /* @ngInject */
  function ExternalNumberService($q, $translate, ExternalNumberPool, NumberSearchServiceV2, PstnSetupService) {
    var service = {
      refreshNumbers: refreshNumbers,
      clearNumbers: clearNumbers,
      setAllNumbers: setAllNumbers,
      getAllNumbers: getAllNumbers,
      getAssignedNumbers: getAssignedNumbers,
      getPendingNumberAndOrder: getPendingNumberAndOrder,
      getPendingNumbers: getPendingNumbers,
      getPendingOrders: getPendingOrders,
      getUnassignedNumbers: getUnassignedNumbers,
      getUnassignedNumbersWithoutPending: getUnassignedNumbersWithoutPending,
      deleteNumber: deleteNumber,
      isTerminusCustomer: isTerminusCustomer,
      getPendingOrderQuantity: getPendingOrderQuantity,
      getQuantity: getQuantity,
      getAssignedNumbersV2: getAssignedNumbersV2,
      getUnassignedNumbersV2: getUnassignedNumbersV2
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

    function refreshNumbers(customerId, queryNumberType, filter) {
      return getPendingNumberAndOrder(customerId)
        .then(function () {
          // Specifying ASSIGNED_AND_UNASSIGNED_NUMBERS and FIXED_LINE_OR_MOBILE returns both
          // assigned and unassigned standard PSTN numbers.
          // Toll-Free numbers should not be returned by default, but can be overridden.
          var externalNumberType = ExternalNumberPool.FIXED_LINE_OR_MOBILE;
          if (!_.isEmpty(queryNumberType)) {
            externalNumberType = queryNumberType;
          }
          filter = !filter ? ExternalNumberPool.NO_PATTERN_MATCHING : filter;
          return ExternalNumberPool.getExternalNumbers(
            customerId,
            filter,
            ExternalNumberPool.ASSIGNED_AND_UNASSIGNED_NUMBERS,
            externalNumberType)
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

    function getPendingNumberAndOrder(customerId) {
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
        });
    }

    function deleteNumber(customerId, number) {
      return isTerminusCustomer(customerId)
        .then(function (isSupported) {
          if (isSupported) {
            return PstnSetupService.deleteNumber(customerId, number.number);
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
          number.label = number.pattern;
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

    function getAssignedNumbersV2(customerId, hint) {
      return NumberSearchServiceV2.get({
        number: hint,
        customerId: customerId,
        type: 'external',
        assigned: 'true'
      }).$promise.then(function (data) {
        return data.numbers;
      });
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

    function getUnassignedNumbersV2(customerId, hint) {
      return NumberSearchServiceV2.get({
        number: hint,
        customerId: customerId,
        type: 'external',
        assigned: 'false'
      }).$promise.then(function (data) {
        return data.numbers;
      });
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
      if (_.find(terminusDetails, { customerId: customerId })) {
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
      return _.sumBy(getPendingOrders(), 'quantity');
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
