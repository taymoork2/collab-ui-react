(function () {
  'use strict';

  angular.module('Huron')
    .factory('ExternalNumberService', ExternalNumberService);

  /* @ngInject */
  function ExternalNumberService($q, ExternalNumberPool, PstnSetupService, FeatureToggleService) {
    var service = {
      refreshNumbers: refreshNumbers,
      clearNumbers: clearNumbers,
      setAllNumbers: setAllNumbers,
      getAllNumbers: getAllNumbers,
      getPendingNumbers: getPendingNumbers,
      getUnassignedNumbers: getUnassignedNumbers
    };
    var allNumbers = [];
    var pendingNumbers = [];
    var unassignedNumbers = [];

    return service;

    function refreshNumbers(customerId) {
      var pstnPromise;
      if (FeatureToggleService.supportsPstnSetup()) {
        pstnPromise = PstnSetupService.listPendingNumbers(customerId, PstnSetupService.INTELEPEER)
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

      return $q.when(pstnPromise)
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
