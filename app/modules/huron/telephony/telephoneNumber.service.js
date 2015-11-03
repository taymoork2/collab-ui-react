/* global phoneUtils */
(function () {
  'use strict';

  angular.module('Huron')
    .factory('TelephoneNumberService', TelephoneNumberService);

  /* @ngInject */
  function TelephoneNumberService(CountryCodes) {
    var countryCode, regionCode;
    var filterRegex = /[^+\d]/g;
    var service = {
      getCountryCode: getCountryCode,
      setCountryCode: setCountryCode,
      getRegionCode: getRegionCode,
      setRegionCode: setRegionCode,
      validateDID: validateDID,
      getDIDValue: getDIDValue,
      getDIDLabel: getDIDLabel
    };

    // Default
    setRegionCode('us');

    return service;

    function setCountryCode(value) {
      countryCode = value;
      regionCode = _.result(_.findWhere(CountryCodes, {
        number: countryCode
      }), 'code');
    }

    function getCountryCode() {
      return countryCode;
    }

    function setRegionCode(region) {
      regionCode = angular.isString(region) ? region.toLowerCase() : '';
      countryCode = _.result(_.findWhere(CountryCodes, {
        code: regionCode
      }), 'number');
    }

    function getRegionCode() {
      return regionCode;
    }

    function validateDID(number) {
      var res;
      try {
        res = phoneUtils.isValidNumberForRegion(number, regionCode);
      } catch (e) {
        res = false;
      }
      return res;
    }

    function getDIDValue(number) {
      if (validateDID(number)) {
        return phoneUtils.formatE164(number, regionCode);
      } else if (angular.isString(number)) {
        return number.replace(filterRegex, '');
      } else {
        return number;
      }
    }

    function getDIDLabel(number) {
      if (validateDID(number)) {
        return phoneUtils.formatNational(number, regionCode);
      } else {
        return number;
      }
    }
  }
})();
