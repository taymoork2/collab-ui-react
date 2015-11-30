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
    var TOLL_FREE = 'TOLL_FREE';
    var PREMIUM_RATE = 'PREMIUM_RATE';

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
      var res = false;
      try {
        var phoneNumberType;
        if (phoneUtils.isValidNumberForRegion(number, regionCode)) {
          phoneNumberType = phoneUtils.getNumberType(number, regionCode);
          switch (phoneNumberType) {
          case TOLL_FREE:
          case PREMIUM_RATE:
            res = false;
            break;
          default:
            res = true;
          }
        }
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
