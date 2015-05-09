(function () {
  'use strict';

  angular
    .module('Core')
    .factory('ValidationService', ValidationService);

  /* @ngInject */
  function ValidationService() {

    var factory = {
      trialLicenseCount: trialLicenseCount
    };

    return factory;

    function trialLicenseCount(viewValue, modelValue) {
      var value = modelValue || viewValue;
      return /^[1-9][0-9]{0,2}$/.test(value);
    }
  }
})();
