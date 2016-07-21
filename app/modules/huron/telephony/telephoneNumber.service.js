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
      getDIDLabel: getDIDLabel,
      getExampleNumbers: getExampleNumbers
    };
    var TOLL_FREE = 'TOLL_FREE';
    var PREMIUM_RATE = 'PREMIUM_RATE';

    var exampleNumbers = {
      us: '15556667777, +15556667777, 1-555-666-7777, +1 (555) 666-7777',
      au: '61255566777, +61255566777, +61 2 5556 6777'
    };

    // Default
    setRegionCode('us');

    return service;

    function setCountryCode(value) {
      value = _.trimLeft(value, '+'); // remove the '+' sign if it exists
      if (value === '1' || value === 1) {
        // Default to US due to shared codes
        setRegionCode('us');
      } else {
        countryCode = value;
        regionCode = _.result(_.findWhere(CountryCodes, {
          number: countryCode
        }), 'code');
      }
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
          case PREMIUM_RATE:
            res = false;
            break;
          case TOLL_FREE:
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

    function getExampleNumbers() {
      return exampleNumbers[regionCode];
    }
  }
})();
