(function () {
  'use strict';

  angular.module('Huron')
    .filter('huntMemberTelephone', huntMemberTelephone);

  /* @ngInject */
  function huntMemberTelephone(PhoneNumberService) {
    return filter;

    function filter(number) {

      if (isNotEmpty(number.external) && isNotEmpty(number.internal)) {
        return format(number.external) + " and " + number.internal;
      }

      if (isNotEmpty(number.external)) {
        return format(number.external);
      }

      if (isNotEmpty(number.internal)) {
        return number.internal;
      }

      return '';
    }

    function format(number) {
      return PhoneNumberService.getNationalFormat(number);
    }

    function isNotEmpty(text) {
      return _.trim(text) !== '';
    }
  }
})();
