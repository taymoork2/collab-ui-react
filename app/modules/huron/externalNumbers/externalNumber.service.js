(function () {
  'use strict';

  angular.module('Huron')
    .factory('ExternalNumberService', ExternalNumberService);

  function ExternalNumberService() {
    var service = {
      setAllNumbers: setAllNumbers,
      getAllNumbers: getAllNumbers
    };
    var allNumbers = [];

    return service;

    function setAllNumbers(_allNumbers) {
      allNumbers = _allNumbers || [];
    }

    function getAllNumbers() {
      return allNumbers;
    }
  }
})();
