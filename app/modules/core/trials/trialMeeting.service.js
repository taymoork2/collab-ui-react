(function () {
  'use strict';

  angular
    .module('core.trial')
    .factory('TrialMeetingService', TrialMeetingService);

  /* @ngInject */
  function TrialMeetingService(Config) {
    var _trialData;
    var service = {
      getData: getData,
      reset: reset,
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
        type: Config.offerTypes.meeting,
        enabled: false,
        details: {},
      };

      _trialData = angular.copy(defaults);
      return _trialData;
    }
  }
})();
