(function () {
  'use strict';

  angular
    .module('core.trial')
    .factory('TrialRoomSystemService', TrialRoomSystemService);

  /* @ngInject */
  function TrialRoomSystemService(Config) {
    var _trialData;
    var service = {
      getData: getData,
      reset: reset,
      hasRoomSystemDeviceAvailable: hasRoomSystemDeviceAvailable,
      canAddRoomSystemDevice: canAddRoomSystemDevice
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
        type: Config.offerTypes.roomSystems,
        enabled: false,
        details: {
          roomSystems: [{
            model: 'CISCO_SX10',
            enabled: false,
            quantity: 0,
            readonly: false,
            valid: true
          }, {
            model: 'CISCO_DX80',
            enabled: false,
            quantity: 0,
            readonly: false,
            valid: true
          }, {
            model: 'CISCO_MX300',
            enabled: false,
            quantity: 0,
            readonly: false,
            valid: true
          }],
        }
      };

      _trialData = angular.copy(defaults);
      return _trialData;
    }

    function hasRoomSystemDeviceAvailable(details) {
      var staticRoomSystems = _.pluck(getData().details.roomSystems, 'model');
      var devices = _.pluck(_.get(details, 'devices', []), 'model');

      return _.difference(staticRoomSystems, devices).length === getData().details.roomSystems.length;
    }

    function canAddRoomSystemDevice(details, enabled) {
      return hasRoomSystemDeviceAvailable(details) && enabled;
    }
  }
})();
