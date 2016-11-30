/* global phoneUtils */
(function () {
  'use strict';

  angular.module('huron.telephoneNumber')
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
      getExampleNumbers: getExampleNumbers,
      getPhoneNumberType: getPhoneNumberType,
      isTollFreeNumber: isTollFreeNumber,
      isPossibleAreaCode: isPossibleAreaCode,
      getDestinationObject: getDestinationObject,
      checkPhoneNumberType: checkPhoneNumberType
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
      value = _.trimStart(value, '+'); // remove the '+' sign if it exists
      if (value === '1' || value === 1) {
        // Default to US due to shared codes
        setRegionCode('us');
      } else {
        countryCode = value;
        regionCode = _.result(_.find(CountryCodes, {
          number: countryCode
        }), 'code');
      }
    }

    function getCountryCode() {
      return countryCode;
    }

    function setRegionCode(region) {
      regionCode = _.isString(region) ? region.toLowerCase() : '';
      countryCode = _.result(_.find(CountryCodes, {
        code: regionCode
      }), 'number');
    }

    function getPhoneNumberType(number) {
      try {
        return phoneUtils.getNumberType(number, regionCode);
      } catch (e) {
        return '';
      }
    }

    function getRegionCode() {
      return regionCode;
    }

    function isTollFreeNumber(number) {
      var res = false;
      try {
        var phoneNumberType;
        if (phoneUtils.isValidNumberForRegion(number, regionCode)) {
          phoneNumberType = phoneUtils.getNumberType(number, regionCode);
          if (phoneNumberType === TOLL_FREE) {
            res = true;
          }
        }
      } catch (e) {
        res = false;
      }
      return res;
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
      } else if (_.isString(number)) {
        return _.replace(number, filterRegex, '');
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

    function isPossibleAreaCode(areaCode) {
      //TODO: needs to be looked at again when service in other countries is available
      try {
        if (regionCode === 'us') {
          return phoneUtils.isPossibleNumber(areaCode + '0000000', regionCode);
        } else if (regionCode === 'au') {
          return phoneUtils.isValidNumber(areaCode + '00000000', regionCode);
        } else {
          return true;
        }
      } catch (e) {
        return false;
      }
    }

    function getDestinationObject(number) {
      try {
        var data = getCountryInfo(phoneUtils.getRegionCodeForNumber(number));
        return {
          name: data.name,
          code: data.code,
          number: data.number,
          phoneNumber: number
        };
      } catch (exception) {
        return { phoneNumber: number };
      }
    }

    function getCountryInfo(code) {
      if (_.isString(code)) {
        code = code.toLowerCase();
        var data = _.find(CountryCodes, function (value) {
          return code === value.code;
        });
        if (_.isUndefined(data)) {
          throw new Error('Country not found');
        } else {
          return data;
        }
      } else {
        throw new Error('Code not found');
      }
    }

    function checkPhoneNumberType(number) {
      var phoneNumberType;
      try {
        if (phoneUtils.isValidNumberForRegion(number, regionCode)) {
          phoneNumberType = phoneUtils.getNumberType(number, regionCode);
        }
      } catch (e) {
        phoneNumberType = undefined;
      }
      return phoneNumberType;
    }
  }
})();
