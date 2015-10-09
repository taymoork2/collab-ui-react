(function () {
  'use strict';

  angular.module('Huron')
    .filter('telephoneNumber', telephoneNumber);

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
