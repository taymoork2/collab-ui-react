(function () {
  'use strict';

  angular
    .module('Core')
    .factory('ValidationService', ValidationService);

  /* @ngInject */
  function ValidationService() {

    var factory = {
      trialLicenseCount: trialLicenseCount,
      nonPrintable: nonPrintable,
      alertingName: alertingName,
      callForward: callForward
    };

    return factory;

    function trialLicenseCount(viewValue, modelValue) {
      var value = modelValue || viewValue;
      return /^[1-9][0-9]{0,2}$/.test(value);
    }

    function nonPrintable(viewValue, modelValue) {
      var value = modelValue || viewValue;
      return /^[^\x00-\x1F]{0,}$/.test(value);
    }

    function alertingName(viewValue, modelValue) {
      var value = modelValue || viewValue;
      return /^[^\]"%<>\[&|{}]{0,}$/.test(value);
    }

    function callForward(viewValue, modelValue) {
      var value = modelValue || viewValue;
      return /^[0-9*#+X]{0,}$/.test(value);
    }
  }
})();
