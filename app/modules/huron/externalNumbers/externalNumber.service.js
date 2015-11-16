(function () {
  'use strict';

  angular.module('Huron')
    .factory('ExternalNumberService', ExternalNumberService);

  /* @ngInject */
  function ExternalNumberService($q, ExternalNumberPool, PstnSetupService, FeatureToggleService, Notification) {
    var service = {
      refreshNumbers: refreshNumbers,
      clearNumbers: clearNumbers,
      setAllNumbers: setAllNumbers,
      getAllNumbers: getAllNumbers,
      getPendingNumbers: getPendingNumbers,
      getUnassignedNumbers: getUnassignedNumbers,
      deleteNumber: deleteNumber
    };
    var allNumbers = [];
    var pendingNumbers = [];
    var unassignedNumbers = [];

    return service;

    function refreshNumbers(customerId) {
      return FeatureToggleService.supportsPstnSetup()
        .then(function (isSupported) {
          if (isSupported) {
            return PstnSetupService.listPendingNumbers(customerId)
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
            .then(function (numbers) {
              unassignedNumbers = filterUnassigned(numbers);
              allNumbers = pendingNumbers.concat(numbers);
            });
        })
        .catch(function (response) {
          clearNumbers();
          return $q.reject(response);
        });
    }

    function deleteNumber(customerId, number) {
      return FeatureToggleService.supportsPstnSetup()
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

    function filterUnassigned(numbers) {
      return numbers.filter(function (number) {
        return angular.isUndefined(number.directoryNumber) || number.directoryNumber === null;
      });
    }

    function filterPending(numbers) {
      return numbers.filter(function (number) {
        return !number.uuid;
      });
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
  }
})();
