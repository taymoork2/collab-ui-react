(function () {
  'use strict';

  angular
    .module('core.trial')
    .factory('TrialDeviceService', TrialDeviceService);

  /* @ngInject */
  function TrialDeviceService(TrialCallService, TrialRoomSystemService) {
    var _trialData;
    var _countryReference = [
      {
        country: 'United States',
        code: 'US'
      },
      {
        country: 'Argentina',
        code: 'AR'
      },
      {
        country: 'Australia',
        code: 'AU'
      },
      {
        country: 'Austria',
        code: 'AT'
      },
      {
        country: 'Belgium',
        code: 'BE'
      },
      {
        country: 'Canada',
        code: 'CA'
      },
      {
        country: 'Chile',
        code: 'CL'
      },
      {
        country: 'Colombia',
        code: 'CO'
      },
      {
        country: 'Costa Rica',
        code: 'CR'
      },
      {
        country: 'Czech Republic',
        code: 'CZ'
      },
      {
        country: 'Denmark',
        code: 'DK'
      },
      {
        country: 'Finland',
        code: 'FI'
      },
      {
        country: 'France',
        code: 'FR'
      },
      {
        country: 'Germany',
        code: 'GE'
      },
      {
        country: 'Ireland',
        code: 'IE'
      },
      {
        country: 'Italy',
        code: 'IT'
      },
      {
        country: 'Luxembourg',
        code: 'LU'
      },
      {
        country: 'Netherlands',
        code: 'NL'
      },
      {
        country: 'Norway',
        code: 'NO'
      },
      {
        country: 'Peru',
        code: 'PE'
      },
      {
        country: 'Poland',
        code: 'PL'
      },
      {
        country: 'Portugal',
        code: 'PT'
      },
      {
        country: 'Slovakia',
        code: 'SK'
      },
      {
        country: 'Spain',
        code: 'ES'
      },
      {
        country: 'Sweden',
        code: 'SE'
      },
      {
        country: 'Switzerland',
        code: 'SC'
      },
      {
        country: 'United Kingdom',
        code: 'GB'
      }
    ];
    var _countries = {
      US: ['United States'],
      ROLLOUT1: ['United States', 'Argentina', 'Australia', 'Austria', 'Belgium', 'Canada', 'Chile', 'Colombia', 'Costa Rica', 'Czech Republic',
      'Denmark', 'Finland', 'France', 'Germany', 'Ireland', 'Italy', 'Luxembourg', 'Netherlands', 'Norway', 'Peru', 'Poland',
      'Portugal', 'Slovakia', 'Spain', 'Sweden', 'Switzerland', 'United Kingdom']

    };

    var countryListTypes = {
      US_ONLY: 'US',
      CISCO_SX10: 'ROLLOUT1',
      CISCO_DX80: 'ROLLOUT1',
      CISCO_MX300: 'US',
      CISCO_8865: 'US',
      CISCO_8845: 'US',
      CISCO_8841: 'US',
      CISCO_7841: 'US'
    };

    var service = {
      getData: getData,
      reset: reset,
      getLimitsPromise: getLimitsPromise,
      getStates: getStates,
      getCountries: getCountries,
      canAddDevice: canAddDevice,
      getCountryCodeByName: getCountryCodeByName
    };

    return service;

    ////////////////

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
          dealId: ''
        },
      };
      _trialData = angular.copy(defaults);
      return _trialData;
    }

    function getLimitsPromise() {
      return _trialData.limitsPromise;
    }

    function getCountries(deviceArray) {
      if (!deviceArray || deviceArray.length === 0) {
        deviceArray = ['US_ONLY'];
      }
      var countryLists = _.map(deviceArray, function (device) {
        return _countries[countryListTypes[device]] || _countries.US;
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
        abbr: 'AL'
      }, {
        state: 'Alaska',
        abbr: 'AK'
      }, {
        state: 'Arizona',
        abbr: 'AZ'
      }, {
        state: 'Arkansas',
        abbr: 'AR'
      }, {
        state: 'California',
        abbr: 'CA'
      }, {
        state: 'Colorado',
        abbr: 'CO'
      }, {
        state: 'Connecticut',
        abbr: 'CT'
      }, {
        state: 'Delaware',
        abbr: 'DE'
      }, {
        state: 'District of Columbia',
        abbr: 'DC'
      }, {
        state: 'Florida',
        abbr: 'FL'
      }, {
        state: 'Georgia',
        abbr: 'GA'
      }, {
        state: 'Hawaii',
        abbr: 'HI'
      }, {
        state: 'Idaho',
        abbr: 'ID'
      }, {
        state: 'Illinois',
        abbr: 'IL'
      }, {
        state: 'Indiana',
        abbr: 'IN'
      }, {
        state: 'Iowa',
        abbr: 'IA'
      }, {
        state: 'Kansas',
        abbr: 'KS'
      }, {
        state: 'Kentucky',
        abbr: 'KY'
      }, {
        state: 'Louisiana',
        abbr: 'LA'
      }, {
        state: 'Maine',
        abbr: 'ME'
      }, {
        state: 'Maryland',
        abbr: 'MD'
      }, {
        state: 'Massachusetts',
        abbr: 'MA'
      }, {
        state: 'Michigan',
        abbr: 'MI'
      }, {
        state: 'Minnesota',
        abbr: 'MN'
      }, {
        state: 'Mississippi',
        abbr: 'MS'
      }, {
        state: 'Missouri',
        abbr: 'MO'
      }, {
        state: 'Montana',
        abbr: 'MT'
      }, {
        state: 'Nebraska',
        abbr: 'NE'
      }, {
        state: 'Nevada',
        abbr: 'NV'
      }, {
        state: 'New Hampshire',
        abbr: 'NH'
      }, {
        state: 'New Jersey',
        abbr: 'NJ'
      }, {
        state: 'New Mexico',
        abbr: 'NM'
      }, {
        state: 'New York',
        abbr: 'NY'
      }, {
        state: 'North Carolina',
        abbr: 'NC'
      }, {
        state: 'North Dakota',
        abbr: 'ND'
      }, {
        state: 'Ohio',
        abbr: 'OH'
      }, {
        state: 'Oklahoma',
        abbr: 'OK'
      }, {
        state: 'Oregon',
        abbr: 'OR'
      }, {
        state: 'Pennsylvania',
        abbr: 'PA'
      }, {
        state: 'Rhode Island',
        abbr: 'RI'
      }, {
        state: 'South Carolina',
        abbr: 'SC'
      }, {
        state: 'South Dakota',
        abbr: 'SD'
      }, {
        state: 'Tennessee',
        abbr: 'TN'
      }, {
        state: 'Texas',
        abbr: 'TX'
      }, {
        state: 'Utah',
        abbr: 'UT'
      }, {
        state: 'Vermont',
        abbr: 'VT'
      }, {
        state: 'Virginia',
        abbr: 'VA'
      }, {
        state: 'Washington',
        abbr: 'WA'
      }, {
        state: 'West Virginia',
        abbr: 'WV'
      }, {
        state: 'Wisconsin',
        abbr: 'WI'
      }, {
        state: 'Wyoming',
        abbr: 'WY'
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
