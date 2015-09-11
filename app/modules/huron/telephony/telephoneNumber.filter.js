(function () {
  'use strict';

  angular.module('Huron')
    .filter('telephoneNumber', telephoneNumber);

  function telephoneNumber() {
    return filter;

    function filter(number) {
      if (!number) {
        return '';
      }

      var countryTelephoneNumberRegex = /(\+?\d{1})(\d{3})(\d{3})(\d{4})/;
      var basicTelephoneNumberRegex = /(\d{3})(\d{3})(\d{4})/;

      if (countryTelephoneNumberRegex.test(number)) {
        return number.replace(countryTelephoneNumberRegex, "$1 ($2) $3-$4");
      } else if (basicTelephoneNumberRegex.test(number)) {
        return number.replace(basicTelephoneNumberRegex, "($1) $2-$3");
      } else {
        return number;
      }
    }
  }
})();
