(function () {
  'use strict';

  module.exports = TrialDeviceService;

  /* @ngInject */
  function TrialDeviceService(TrialCallService, TrialRoomSystemService) {
    var _trialData;
    var _countryReference = [
      {
        country: 'United States',
        code: 'US',
      },
      {
        country: 'Argentina',
        code: 'AR',
      },
      {
        country: 'Australia',
        code: 'AU',
      },
      {
        country: 'Austria',
        code: 'AT',
      },
      {
        country: 'Belgium',
        code: 'BE',
      },
      {
        country: 'Brazil',
        code: 'BR',
      },
      {
        country: 'Bulgaria',
        code: 'BG',
      },
      {
        country: 'Canada',
        code: 'CA',
      },
      {
        country: 'Chile',
        code: 'CL',
      },
      {
        country: 'Colombia',
        code: 'CO',
      },
      {
        country: 'Costa Rica',
        code: 'CR',
      },
      {
        country: 'Croatia',
        code: 'HR',
      },
      {
        country: 'Cyprus',
        code: 'CY',
      },
      {
        country: 'Czech Republic',
        code: 'CZ',
      },
      {
        country: 'Denmark',
        code: 'DK',
      },
      {
        country: 'Estonia',
        code: 'EE',
      },
      {
        country: 'Finland',
        code: 'FI',
      },
      {
        country: 'France',
        code: 'FR',
      },
      {
        country: 'Germany',
        code: 'GE',
      },
      {
        country: 'Hungary',
        code: 'HU',
      },
      {
        country: 'Ireland',
        code: 'IE',
      },
      {
        country: 'Italy',
        code: 'IT',
      },
      {
        country: 'Lativa',
        code: 'LV',
      },
      {
        country: 'Lithuania',
        code: 'LT',
      },
      {
        country: 'Luxembourg',
        code: 'LU',
      },
      {
        country: 'Netherlands',
        code: 'NL',
      },
      {
        country: 'Norway',
        code: 'NO',
      },
      {
        country: 'Peru',
        code: 'PE',
      },
      {
        country: 'Poland',
        code: 'PL',
      },
      {
        country: 'Portugal',
        code: 'PT',
      },
      {
        country: 'Romania',
        code: 'RO',
      },
      {
        country: 'Slovakia',
        code: 'SK',
      },
      {
        country: 'Slovenia',
        code: 'SI',
      },
      {
        country: 'Spain',
        code: 'ES',
      },
      {
        country: 'Sweden',
        code: 'SE',
      },
      {
        country: 'Switzerland',
        code: 'SC',
      },
      {
        country: 'Ukraine',
        code: 'UA',
      },
      {
        country: 'United Kingdom',
        code: 'GB',
      },
    ];
    var _countries = {
      US: ['United States'],
      ROLLOUT1: ['United States', 'Australia', 'Austria', 'Belgium', 'Bulgaria', 'Canada', 'Croatia', 'Cyprus', 'Czech Republic',
        'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Hungary', 'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Netherlands', 'Norway', 'Poland',
        'Portugal', 'Romania', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'Ukraine', 'United Kingdom'],
      ROLLOUT2: ['United States', 'Canada'],
    };

    /* ROLLOUT3 = ROLLOUT1 + Brazil */
    _countries.ROLLOUT3 = _.concat(_countries.ROLLOUT1, ['Brazil']).sort();

    var _deviceLimit = {
      roomSystems: {
        min: 1,
        max: 3,
        type: 'ROOM_SYSTEMS',
        errorMessage: 'trialModal.call.invalidRoomSystemsQuantity',
      },
      callDevices: {
        min: 1,
        max: 4,
        type: 'CALL_DEVICES',
        errorMessage: 'trialModal.call.invalidPhonesQuantity',
      },
      totalDevices: {
        min: 1,
        max: 5,
        type: 'TOTAL',
      },
      CISCO_SX10: {
        min: 1,
        max: 3,
        model: 'CISCO_SX10',
        type: 'ROOM_SYSTEMS',
      },
      CISCO_DX80: {
        min: 1,
        max: 3,
        model: 'CISCO_DX80',
        type: 'ROOM_SYSTEMS',
      },
      CISCO_MX300: {
        min: 1,
        max: 1,
        model: 'CISCO_MX300',
        type: 'ROOM_SYSTEMS',
      },
      CISCO_ROOM_KIT: {
        min: 1,
        max: 1,
        model: 'CISCO_ROOM_KIT',
        type: 'ROOM_SYSTEMS',
      },
      CISCO_8865: {
        min: 1,
        max: 4,
        model: 'CISCO_8865',
        type: 'CALL_DEVICES',
      },
      CISCO_8845: {
        min: 1,
        max: 4,
        model: 'CISCO_8845',
        type: 'CALL_DEVICES',
      },
      CISCO_7832: {
        min: 1,
        max: 4,
        model: 'CISCO_7832',
        type: 'CALL_DEVICES',
      },
      CISCO_8841: {
        min: 1,
        max: 4,
        model: 'CISCO_8841',
        type: 'CALL_DEVICES',
      },
      CISCO_7841: {
        min: 1,
        max: 4,
        model: 'CISCO_7841',
        type: 'CALL_DEVICES',
      },
    };

    var listTypes = {
      ROLLOUT1: 'ROLLOUT1',
      ROLLOUT2: 'ROLLOUT2',
      US_ONLY: 'US',
    };

    var countryListTypes = {
      US_ONLY: 'US',
      CISCO_SX10: 'ROLLOUT1',
      CISCO_DX80: 'ROLLOUT3',
      CISCO_MX300: 'US',
      CISCO_ROOM_KIT: 'ROLLOUT1',
      CISCO_8865: 'ROLLOUT2',
      CISCO_8845: 'ROLLOUT2',
      CISCO_8841: 'ROLLOUT2',
      CISCO_7832: 'ROLLOUT2',
      CISCO_7841: 'ROLLOUT2',
    };


    var service = {
      getData: getData,
      reset: reset,
      getLimitsPromise: getLimitsPromise,
      getStates: getStates,
      getCountries: getCountries,
      canAddDevice: canAddDevice,
      getCountryCodeByName: getCountryCodeByName,
      getDeviceLimit: getDeviceLimit,
      listTypes: listTypes,
    };

    return service;

    ////////////////

    function getDeviceLimit() {
      return _deviceLimit;
    }

    function getData() {
      return _trialData || _makeTrial();
    }

    function reset() {
      _makeTrial();
    }

    function _makeTrial() {
      var defaults = {
        skipDevices: false,
        shippingInfo: {
          type: 'CUSTOMER',
          name: '',
          phoneNumber: '',
          country: '',
          addressLine1: '',
          unit: '',
          city: '',
          state: '',
          postalCode: '',
          dealId: '',
        },
      };
      _trialData = _.cloneDeep(defaults);
      return _trialData;
    }

    function getLimitsPromise() {
      return _trialData.limitsPromise;
    }

    function getCountries(deviceArray, replacementArray) {
      // replacementArray used in cases when the contry list association for device(s)
      // needs to be temporarily changed for example in case of a feature
      if (!deviceArray || deviceArray.length === 0) {
        deviceArray = ['US_ONLY'];
      }
      var countryLists = _.map(deviceArray, function (device) {
        //get country lists with patched replacements if any
        var countryListName = _.chain(replacementArray)
          .find({ default: countryListTypes[device] })
          .get('override', countryListTypes[device])
          .value();
        return _countries[countryListName] || _countries.US;
      });
      return _.map(_.intersection.apply(null, countryLists), function (country) {
        return { country: country };
      });
    }

    function getCountryCodeByName(countryName) {
      return _.chain(_countryReference).find({ country: countryName }).get('code').value();
    }

    function getStates() {
      return [{
        state: 'Alabama',
        abbr: 'AL',
      }, {
        state: 'Alaska',
        abbr: 'AK',
      }, {
        state: 'Arizona',
        abbr: 'AZ',
      }, {
        state: 'Arkansas',
        abbr: 'AR',
      }, {
        state: 'California',
        abbr: 'CA',
      }, {
        state: 'Colorado',
        abbr: 'CO',
      }, {
        state: 'Connecticut',
        abbr: 'CT',
      }, {
        state: 'Delaware',
        abbr: 'DE',
      }, {
        state: 'District of Columbia',
        abbr: 'DC',
      }, {
        state: 'Florida',
        abbr: 'FL',
      }, {
        state: 'Georgia',
        abbr: 'GA',
      }, {
        state: 'Hawaii',
        abbr: 'HI',
      }, {
        state: 'Idaho',
        abbr: 'ID',
      }, {
        state: 'Illinois',
        abbr: 'IL',
      }, {
        state: 'Indiana',
        abbr: 'IN',
      }, {
        state: 'Iowa',
        abbr: 'IA',
      }, {
        state: 'Kansas',
        abbr: 'KS',
      }, {
        state: 'Kentucky',
        abbr: 'KY',
      }, {
        state: 'Louisiana',
        abbr: 'LA',
      }, {
        state: 'Maine',
        abbr: 'ME',
      }, {
        state: 'Maryland',
        abbr: 'MD',
      }, {
        state: 'Massachusetts',
        abbr: 'MA',
      }, {
        state: 'Michigan',
        abbr: 'MI',
      }, {
        state: 'Minnesota',
        abbr: 'MN',
      }, {
        state: 'Mississippi',
        abbr: 'MS',
      }, {
        state: 'Missouri',
        abbr: 'MO',
      }, {
        state: 'Montana',
        abbr: 'MT',
      }, {
        state: 'Nebraska',
        abbr: 'NE',
      }, {
        state: 'Nevada',
        abbr: 'NV',
      }, {
        state: 'New Hampshire',
        abbr: 'NH',
      }, {
        state: 'New Jersey',
        abbr: 'NJ',
      }, {
        state: 'New Mexico',
        abbr: 'NM',
      }, {
        state: 'New York',
        abbr: 'NY',
      }, {
        state: 'North Carolina',
        abbr: 'NC',
      }, {
        state: 'North Dakota',
        abbr: 'ND',
      }, {
        state: 'Ohio',
        abbr: 'OH',
      }, {
        state: 'Oklahoma',
        abbr: 'OK',
      }, {
        state: 'Oregon',
        abbr: 'OR',
      }, {
        state: 'Pennsylvania',
        abbr: 'PA',
      }, {
        state: 'Rhode Island',
        abbr: 'RI',
      }, {
        state: 'South Carolina',
        abbr: 'SC',
      }, {
        state: 'South Dakota',
        abbr: 'SD',
      }, {
        state: 'Tennessee',
        abbr: 'TN',
      }, {
        state: 'Texas',
        abbr: 'TX',
      }, {
        state: 'Utah',
        abbr: 'UT',
      }, {
        state: 'Vermont',
        abbr: 'VT',
      }, {
        state: 'Virginia',
        abbr: 'VA',
      }, {
        state: 'Washington',
        abbr: 'WA',
      }, {
        state: 'West Virginia',
        abbr: 'WV',
      }, {
        state: 'Wisconsin',
        abbr: 'WI',
      }, {
        state: 'Wyoming',
        abbr: 'WY',
      }];
    }

    function canAddDevice(details, roomSystemsEnabled, callEnabled, canSeeDevicePage) {
      if (!canSeeDevicePage) {
        return false;
      }
      return (TrialRoomSystemService.canAddRoomSystemDevice(details, roomSystemsEnabled) || TrialCallService.canAddCallDevice(details, callEnabled));
    }
  }
})();
