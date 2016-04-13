(function () {
  'use strict';

  angular.module('Huron')
    .factory('ExternalNumberService', ExternalNumberService);

  /* @ngInject */
  function ExternalNumberService($q, ExternalNumberPool, NumberSearchServiceV2, PstnSetupService, TelephoneNumberService, Notification) {
    var service = {
      refreshNumbers: refreshNumbers,
      clearNumbers: clearNumbers,
      setAllNumbers: setAllNumbers,
      getAllNumbers: getAllNumbers,
      getPendingNumbers: getPendingNumbers,
      getUnassignedNumbers: getUnassignedNumbers,
      getUnassignedNumbersWithoutPending: getUnassignedNumbersWithoutPending,
      deleteNumber: deleteNumber,
      isTerminusCustomer: isTerminusCustomer
    };
    var allNumbers = [];
    var pendingNumbers = [];
    var unassignedNumbers = [];
    var terminusDetails = [];

    return service;

    function refreshNumbers(customerId) {
      return isTerminusCustomer(customerId)
        .then(function (isSupported) {
          if (isSupported) {
            return PstnSetupService.listPendingNumbers(customerId)
              .then(formatNumberLabels)
              .then(function (numbers) {
                pendingNumbers = numbers;
              })
              .catch(function (response) {
                pendingNumbers = [];
                if (!response || response.status !== 404) {
                  return $q.reject(response);
                }
              });
          }
        })
        .then(function () {
          return ExternalNumberPool.getAll(customerId)
            .then(formatNumberLabels)
            .then(function (numbers) {
              unassignedNumbers = filterUnassigned(numbers);
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
    }

    function formatNumberLabels(numbers) {
      _.forEach(numbers, function (number) {
        number.label = TelephoneNumberService.getDIDLabel(number.pattern);
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

    function setAllNumbers(_allNumbers) {
      allNumbers = _allNumbers || [];
      unassignedNumbers = filterUnassigned(allNumbers);
      pendingNumbers = filterPending(allNumbers);
    }

    function getAllNumbers() {
      return allNumbers;
    }

    function getPendingNumbers() {
      return pendingNumbers;
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
  }
})();
