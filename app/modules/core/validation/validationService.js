(function () {
  'use strict';

  /* eslint no-control-regex:0 */

  angular
    .module('Core')
    .factory('ValidationService', ValidationService);

  /* @ngInject */
  function ValidationService() {

    var factory = {
      trialLicenseCount: trialLicenseCount,
      trialRoomSystemQuantity: trialRoomSystemQuantity,
      nonPrintable: nonPrintable,
      alertingName: alertingName,
      callForward: callForward,
      numeric: numeric,
      positiveNumber: positiveNumber,
      maxNumber100: maxNumber100
    };

    return factory;

    function trialLicenseCount(viewValue, modelValue) {
      var value = modelValue || viewValue;
      return /^[1-9][0-9]{0,2}$/.test(value);
    }

    function trialRoomSystemQuantity(viewValue, modelValue) {
      var value = modelValue || viewValue;
      return /^(2[0]|1[0-9]|[1-9])$/.test(value);
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
      return /^[0-9*#+X]{0,}$/.test(value) || /^Voicemail$/.test(value);
    }

    function numeric(viewValue, modelValue) {
      var value = modelValue || viewValue;
      return /^\d*$/.test(value);
    }

    function positiveNumber(viewValue, modelValue) {
      var value = modelValue || viewValue;
      return (angular.isString(value) && value.length === 0) || value > 0;
    }

    function maxNumber100(viewValue, modelValue) {
      var value = modelValue || viewValue;
      return value <= 100;
    }
  }
})();
