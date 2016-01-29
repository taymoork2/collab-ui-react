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
        'type': Config.offerTypes.call,
        'enabled': false,
        'details': {
          'roomSystems': [{
            model: 'sx10',
            enabled: false,
            quantity: 0
          }],
          'phones': [{
            model: '8865',
            enabled: false,
            quantity: 0
          }, {
            model: '8845',
            enabled: false,
            quantity: 0
          }, {
            model: '8841',
            enabled: false,
            quantity: 0
          }, {
            model: '7841',
            enabled: false,
            quantity: 0
          }],
          'shippingInfo': [{
            'isPrimary': true,
            'name': '',
            'phoneNumber': '',
            'address': '',
            'recipientType': ''
          }]
        }
      };

      _trialData = angular.copy(defaults);
      return _trialData;
    }
  }
})();
