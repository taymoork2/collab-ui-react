(function () {
  'use strict';

  angular
    .module('core.trial')
    .factory('TrialCallService', TrialCallService);

  /* @ngInject */
  function TrialCallService(Config) {
    var _trialData;
    var service = {
      getData: getData,
      reset: reset,
      getStateList: getStateList,
      getCountryList: getCountryList
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
        type: Config.offerTypes.call,
        enabled: false,
        details: {
          roomSystems: [{
            model: 'CISCO_SX10',
            enabled: false,
            quantity: 0
          }],
          phones: [{
            model: 'CISCO_8865',
            enabled: false,
            quantity: 0
          }, {
            model: 'CISCO_8845',
            enabled: false,
            quantity: 0
          }, {
            model: 'CISCO_8841',
            enabled: false,
            quantity: 0
          }, {
            model: 'CISCO_7841',
            enabled: false,
            quantity: 0
          }],
          shippingInfo: {
            type: 'CUSTOMER'
          }
        }
      };

      _trialData = angular.copy(defaults);
      return _trialData;
    }

    function getCountryList() {
      return [{
        country: 'United States',
        code: 'USA'
      }];
    }

    function getStateList() {
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
  }
})();
