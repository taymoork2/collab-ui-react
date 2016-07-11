(function () {
  'use strict';

  angular.module('Huron')
    .filter('callParkMemberTelephone', callParkMemberTelephone);

  /* @ngInject */
  function callParkMemberTelephone(TelephoneNumberService) {
    return filter;

    function filter(number) {

      if (isNotEmpty(number.external) && isNotEmpty(number.internal)) {
        return format(number.external) + " and " + format(number.internal);
      }

      if (isNotEmpty(number.external)) {
        return format(number.external);
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
      return (text !== null && text.trim() !== '');
    }
  }
})();
