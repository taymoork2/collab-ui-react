(function () {
  'use strict';

  module.exports = angular.module('huron.telephoneNumber', [])
    .filter('telephoneNumber', telephoneNumber)
    .name;

  /* @ngInject */
  function telephoneNumber(TelephoneNumberService) {
    return filter;

    function filter(number) {
      if (!number) {
        return '';
      }

      return TelephoneNumberService.getDIDLabel(number);
    }
  }
})();
