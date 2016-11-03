(function () {
  'use strict';

  angular
    .module('core.trial')
    .factory('TrialSparkBoardService', TrialSparkBoardService);

  /* @ngInject */
  function TrialSparkBoardService(Config) {
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
        type: Config.offerTypes.sparkBoard,
        enabled: false,
        details: {
          roomSystems: [
            {
              model: 'CISCO_SPARK_BOARD',
              enabled: false,
              quantity: 0,
              readonly: false,
              valid: true
            }
          ],
        }
      };

      _trialData = angular.copy(defaults);
      return _trialData;
    }

    function hasRoomSystemDeviceAvailable(details) {
      var staticRoomSystems = _.map(getData().details.roomSystems, 'model');
      var devices = _.map(_.get(details, 'devices', []), 'model');

      return _.difference(staticRoomSystems, devices).length === getData().details.roomSystems.length;
    }

    function canAddRoomSystemDevice(details, enabled) {
      return hasRoomSystemDeviceAvailable(details) && enabled;
    }
  }
})();
