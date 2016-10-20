(function () {
  'use strict';

  angular
    .module('core.onboard')
    .factory('OnboardService', OnboardService);

  /* @ngInject */
  function OnboardService() {
    var service = {
      huronCallEntitlement: false,
      validateEmail: validateEmail,
      usersToOnboard: [],
      maxUsersInManual: 25
    };

    return service;

    ////////////////

    //email validation logic
    function validateEmail(input) {
      var emailregex = /\S+@\S+\.\S+/;
      var emailregexbrackets = /<\s*\S+@\S+\.\S+\s*>/;
      var emailregexquotes = /"\s*\S+@\S+\.\S+\s*"/;
      var valid = false;

      if (/[<>]/.test(input) && emailregexbrackets.test(input)) {
        valid = true;
      } else if (/["]/.test(input) && emailregexquotes.test(input)) {
        valid = true;
      } else if (!/[<>]/.test(input) && !/["]/.test(input) && emailregex.test(input)) {
        valid = true;
      }

      return valid;
    }

  }
})();
