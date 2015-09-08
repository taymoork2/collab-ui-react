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
      var filteredNumber = number.replace(/\D/g, "");

      switch (filteredNumber.length) {
      case 10:
        return filteredNumber.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
      case 11:
        return filteredNumber.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, "$1 ($2) $3-$4");
      default:
        return filteredNumber;
      }
    }
  }
})();
