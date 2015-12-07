(function () {
  'use strict';

  angular
    .module('core.trial')
    .factory('TrialCallService', TrialCallService);

  /* @ngInject */
  function TrialCallService(Config) {
    var _trialData;
    var service = {
      'getData': getData,
      'reset': reset,
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
        'type': Config.trials.call,
        'enabled': false,
        'readonly': false,
        'details': {
          'cameras': {
            'sx10': {
              enabled: false,
              quantity: 0
            },
          },
          'phones': {
            'phone8865': {
              enabled: false,
              quantity: 0
            },
            'phone8845': {
              enabled: false,
              quantity: 0
            },
            'phone7861': {
              enabled: false,
              quantity: 0
            },
            'phone7841': {
              enabled: false,
              quantity: 0
            },
          },
          'address': '',
          'shippingInfo': {
            'country': '',
            'name': '',
            'phone': '',
            'street': '',
            'city': '',
            'state': '',
            'zip': '',
          },
        },
      };

      _trialData = angular.copy(defaults);
      return _trialData;
    }
  }
})();
