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
      hasCallDevicesAvailable: hasCallDevicesAvailable,
      canAddCallDevice: canAddCallDevice
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
          phones: [{
            model: 'CISCO_8865',
            enabled: false,
            quantity: 0,
            readonly: false
          }, {
            model: 'CISCO_8845',
            enabled: false,
            quantity: 0,
            readonly: false
          }, {
            model: 'CISCO_8841',
            enabled: false,
            quantity: 0,
            readonly: false
          }, {
            model: 'CISCO_7841',
            enabled: false,
            quantity: 0,
            readonly: false
          }]
        }
      };

      _trialData = angular.copy(defaults);
      return _trialData;
    }

    function hasCallDevicesAvailable(details) {
      var staticPhones = _.pluck(getData().details.phones, 'model');
      var devices = _.pluck(_.get(details, 'devices', []), 'model');

      return _.difference(staticPhones, devices).length === getData().details.phones.length;
    }

    function canAddCallDevice(details, enabled) {
      return hasCallDevicesAvailable(details) && enabled;
    }
  }
})();
