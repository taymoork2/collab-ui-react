(function () {
  'use strict';

  angular
    .module('core.trial')
    .factory('TrialRoomSystemService', TrialRoomSystemService);

  /* @ngInject */
  function TrialRoomSystemService(Config) {
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
        'type': Config.trials.roomSystems,
        'enabled': false,
        'details': {
          'quantity': 0,
        },
      };

      _trialData = angular.copy(defaults);
      return _trialData;
    }
  }
})();
