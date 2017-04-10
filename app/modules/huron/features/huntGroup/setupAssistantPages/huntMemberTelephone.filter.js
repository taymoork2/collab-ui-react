(function () {
  'use strict';

  angular.module('Huron')
    .filter('huntMemberTelephone', huntMemberTelephone);

  /* @ngInject */
  function huntMemberTelephone(TelephoneNumberService) {
    return filter;

    function filter(number) {

      if (isNotEmpty(number.external) && isNotEmpty(number.internal)) {
        return number.external + " and " + format(number.internal);
      }

      if (isNotEmpty(number.external)) {
        return number.external;
      }

      if (isNotEmpty(number.internal)) {
        return format(number.internal);
      }

      return '';
    }

    function format(number) {
      return TelephoneNumberService.getDIDLabel(number);
    }

    function isNotEmpty(text) {
      return _.trim(text) !== '';
    }
  }
})();
